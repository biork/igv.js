/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2016-2017 The Regents of the University of California
 * Author: Jim Robinson
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

import FeatureSource from '../feature/featureSource.js'
import IGVGraphics from "../igv-canvas.js"
import { ROI_DEFAULT_COLOR, screenCoordinates } from "./ROISet.js"

class TrackROISet {

    constructor(config, genome) {
        this.name = config.name
        this.featureSource = config.featureSource || FeatureSource(config, genome)
        this.color = config.color || ROI_DEFAULT_COLOR
    }

    async getFeatures(chr, start, end) {
        return this.featureSource.getFeatures({chr, start, end})
    }

    draw(drawConfiguration) {

        const { context, bpPerPixel, bpStart, pixelTop, pixelHeight, pixelWidth, features, } = drawConfiguration

        if (!features) {
            return
        }

        const bpEnd = bpStart + (pixelWidth * bpPerPixel) + 1
        for (let { start:regionStartBP, end:regionEndBP } of features) {

            if (regionEndBP < bpStart) {
                continue
            }

            if (regionStartBP > bpEnd) {
                break
            }

            const { x, width } = screenCoordinates(regionStartBP, regionEndBP, bpStart, bpPerPixel)
            IGVGraphics.fillRect(context, x, pixelTop, width, pixelHeight, { fillStyle: this.color })
        }
    }
}

export default TrackROISet
