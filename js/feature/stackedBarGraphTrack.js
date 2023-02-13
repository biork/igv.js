/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2014 Broad Institute
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

import FeatureSource from './featureSource.js'
import TrackBase from "../trackBase.js"
import IGVGraphics from "../igv-canvas.js"
import paintAxis from "../util/paintAxis.js"
import {StringUtils} from "../../node_modules/igv-utils/src/index.js"
import {calculateFeatureCoordinates} from "./render/renderFeature.js"


/**
 * Renders stacked bar graphs with bars covering genomic ranges.
 *
 * This was _motivated_ by the need to show allelic expression at SNVs, but
 * the implementation has been generalized from that use case:
 * 1. bars can be arbitrarily wide (in bp)
 * 2. an arbitrary number of (differently-colored) bars can be stacked
 * 	over a given region.
 * The decision was made to deliver the data for the bars in the "name"
 * field of the BED format (which is already widely "misused" for things
 * other than names), because IGV already had implemented the capability to
 * parse that field like column 9 of GFF3 is parsed (as semicolon-separated
 * key=value pairs).
 * 
 * Much of this' current implementation has been copied/adapted from
 * wigTrack and featureTrack, which argues for factoring the relevant
 * parts out of all classes (or into TrackBase?).
 *
 * draw is obviously specific to this class and the various popup
 * and context menu functions are stubbed and still need implementations.
 */
class StackedBarGraphTrack extends TrackBase {

    constructor(config, browser) {
        super(config, browser)
    }

    init(config) {
        super.init(config)

				// Log absence of _required_ properties here

        this.type = config.type
        this.paintAxis = paintAxis

        if (config._featureSource) {
            this.featureSource = config._featureSource
            delete config._featureSource
        } else {
            this.featureSource = config.featureSource ?
                config.featureSource :
                FeatureSource(config, this.browser.genome)
        }

        // Set default heights
        this.autoHeight = config.autoHeight
        //this.margin = config.margin === undefined ? 10 : config.margin
				this.height = config.height

        this.autoscale = config.autoscale || config.max === undefined
        if (!this.autoscale) {
            this.dataRange = {
                min: config.min || 0,
                max: config.max
            }
        }
				//monitorTrackDrag(this)
    }

    async postInit() {

        if (typeof this.featureSource.getHeader === "function") {
            this.header = await this.featureSource.getHeader()
            if(this.disposed) return;   // This track was removed during async load
        }

        // Set properties from track line
			// This _might_ make sense to re-enable since UCSC's track lines to, I think,
			// support their bargraph tracks(?)
        /*if (this.header) {
            this.setTrackProperties(this.header)
        }*/

        if (this.visibilityWindow === undefined && typeof this.featureSource.defaultVisibilityWindow === 'function') {
            this.visibilityWindow = await this.featureSource.defaultVisibilityWindow()
        }

        return this
    }

    get supportsWholeGenome() {
        if (this.config.supportsWholeGenome !== undefined) {
            return this.config.supportsWholeGenome
        } else if (this.featureSource && typeof this.featureSource.supportsWholeGenome === 'function') {
            return this.featureSource.supportsWholeGenome()
        } else {
            if (this.visibilityWindow === undefined && (this.config.indexed === false || !this.config.indexURL)) {
                return true
            }
        }
    }

    async getFeatures(chr, start, end, bpPerPixel) {
        const visibilityWindow = this.visibilityWindow
        return this.featureSource.getFeatures({chr, start, end, bpPerPixel, visibilityWindow})
    };

		// TrackView will set "content height" equal to viewport height if computePixelHeight is
		// absent, and that's just fine.

		/**
		 * Copied verbatim from wigTrack
		 */
    getScaleFactor(min, max, height, logScale) {
        const scale = logScale ? height / (Math.log10(max + 1) - (min <= 0 ? 0 : Math.log10(min + 1))) : height / (max - min)
        return scale
    }

		/**
		 * This is copied verbatim from wigTrack but THE RESULT IS INVERTED
		 */
		computeYPixelValue(yValue, yScaleFactor) {
				return (! this.flipAxis ? (yValue - this.dataRange.min) : (this.dataRange.max - yValue)) * yScaleFactor
    }

		/**
		 * This is copied verbatim from wigTrack but THE RESULT IS INVERTED.
		 */
    computeYPixelValueInLogScale(yValue, yScaleFactor) {
        let maxValue = this.dataRange.max
        let minValue = this.dataRange.min
        if (maxValue <= 0) return 0 // TODO:
        if (minValue <= -1) minValue = 0
        minValue = (minValue <= 0) ? 0 : Math.log10(minValue + 1)
        maxValue = Math.log10(maxValue + 1)
        yValue = Math.log10(yValue + 1)
        return ((! this.flipAxis ? (yValue - minValue) : (maxValue - yValue)) * yScaleFactor)
    }

		/**
		 * Each "feature" is a stack of colored rectangles.
		 *
		 * When features corresponding to SNVs this track is intended to
		 * overlay a wiggle track, in which case the stack height should
		 * exactly coincide with the wiggle height at a given position,
		 * and total height is calculated identically to wiggle.
		 *
		 * Alternatively, bar stacks may be used as background shading, in
		 * which case height is clamped to trackView pixel height.
		 */
    draw( options ) {

			const featureList = options.features
			const ctx = options.context
			const bpStart = options.bpStart
			const pixelWidth = options.pixelWidth
			const pixelHeight = options.pixelHeight
			const bpEnd = bpStart + pixelWidth * options.bpPerPixel + 1

			if (!this.config.isMergedTrack) {
				IGVGraphics.fillRect(ctx, 0, options.pixelTop, pixelWidth, pixelHeight, {'fillStyle': "rgb(255, 255, 255)"})
			}

			if( ! featureList ) {
				console.log("No features to draw.")
				return
			}

      if (this.dataRange.min === undefined) {
				this.dataRange.min = 0
			}
      if (this.dataRange.max <= this.dataRange.min) {
				console.log( `this.dataRange.max(${this.dataRange.max}) <= this.dataRange.min (${this.dataRange.min})` );
				return;
			}

			const scaleFactor = this.getScaleFactor(this.dataRange.min, this.dataRange.max, options.pixelHeight, this.logScale)
			const yScale = (dataValue) => this.logScale
					? this.computeYPixelValueInLogScale( dataValue, scaleFactor )
					: this.computeYPixelValue(           dataValue, scaleFactor )

			for( let f of featureList) {

				if( f.end < bpStart ) continue
				if( f.start > bpEnd ) break

				let sizes = f.sizes;
				let N = sizes.length;

				try {

					ctx.save()

					// X coordinates are same for all bars in the stack.

					const pixelWidth = options.pixelWidth   // typical 3*viewportWidth
					const coord = calculateFeatureCoordinates( f, bpStart, options.bpPerPixel );
					const xLeft = Math.max( 0, coord.px );
					const width = Math.min( pixelWidth, coord.px1 ) - xLeft;

					// Y coordinates change.

					let sum = sizes.reduce( (a,x) => a+x, 0 );
					const H = yScale(sum);
					// In order to draw bars bottom-to-top...
					var y = this.height; // ...since y increases down.

					for(var i = 0; i < sizes.length; i++ ) {
						const h = H * sizes[i] / sum;
						y -= h;
						ctx.fillStyle = i < N ? this.color[ i ] : "black";
						ctx.strokeStyle = ctx.fillStyle;
						ctx.fillRect( xLeft, y, width, h );
					}

				} finally {
					ctx.restore()
				}
			}
    }

    clickedFeatures(clickState, features) {
				console.log( "clickedFeatures( ", clickState, features, ")" )
				return undefined
    }

    /**
     * Return "popup data" for feature @ genomic location.  Data is an array of key-value pairs
     */
    popupData(clickState, features) {
				console.log( "popupData(", clickState, features, ")" )
        return [["key1","value1"],["key2","value2"],]
    }

    menuItemList() {
				console.log( "menuItemList()" )
        return undefined
    }

    contextMenuItemList(clickState) {
				console.log( "contextMenuItemList(", clickState, ")" )
        return undefined
    }

    description() {
				return "<html>TODO</html>"
    }

    /**
     * Called when the track is removed.  Do any needed cleanup here
     */
    dispose() {
        this.trackView = undefined
    }
}

export default StackedBarGraphTrack;

