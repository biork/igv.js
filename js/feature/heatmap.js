
import { calculateFeatureCoordinates } from './render/renderFeature.js'

/**
 * 64-color palettes of use primarily for heatmaps.
 *
 * "Sequential" palettes have the "uninteresting" color at their lower ends
 * and highlighting colors at their upper end.
 * "Diverging" palettes have the "uninteresting" colors in their middles and
 * contrasting highlights at the lower and upper ends.
 *
 * These were adapted from matplotlib and the colorspace package from R.
 */

const palettes = {
	sequential:{
		gray:[ // a default map with low color resolution
			"#000000", "#101010", "#202020", "#303030", "#404040", "#505050", "#606060", "#707070",
			"#8F8F8F", "#9F9F9F", "#AFAFAF", "#BFBFBF", "#CFCFCF", "#DFDFDF", "#EFEFEF", "#FFFFFF"],
		Inferno:[
			"#000003", "#010109", "#030212", "#06041b", "#0a0723", "#0f092d", "#140b36", "#1a0b40",
			"#200c4a", "#270b52", "#2e0a5a", "#350960", "#3c0965", "#430a68", "#4a0b6a", "#500d6c",
			"#570f6d", "#5d126e", "#63146e", "#6a176e", "#70196e", "#761b6d", "#7d1d6c", "#83206b",
			"#892269", "#902468", "#962666", "#9c2963", "#a32b61", "#a92e5e", "#af315b", "#b53357",
			"#bf3951", "#c53d4d", "#cb4049", "#d04544", "#d54940", "#da4e3b", "#de5337", "#e35832",
			"#e65e2d", "#ea6428", "#ed6a23", "#f0701e", "#f37719", "#f57e14", "#f7850e", "#f98c09",
			"#fa9306", "#fb9b06", "#fba208", "#fbaa0e", "#fbb116", "#fbb91e", "#fac128", "#f8c931",
			"#f7d13c", "#f5d948", "#f3e056", "#f1e864", "#f1ee74", "#f2f485", "#f6fa95", "#fcfea4"],
		Magma:[
			"#000003", "#010109", "#030311", "#060519", "#0a0722", "#0e0a2a", "#120d33", "#170f3c",
			"#1c1046", "#221150", "#281159", "#2f1062", "#350f6a", "#3c0f71", "#430f75", "#4a1079",
			"#50127b", "#57147d", "#5d177e", "#63197f", "#691c80", "#6f1e81", "#762181", "#7c2381",
			"#822581", "#892881", "#8f2a80", "#952c80", "#9c2e7f", "#a3307e", "#a9327c", "#b0347b",
			"#bb3877", "#c23a75", "#c83d72", "#ce4070", "#d4436d", "#da4769", "#e04b66", "#e55063",
			"#ea5560", "#ee5b5e", "#f1615c", "#f4685b", "#f6705b", "#f8775c", "#fa7f5e", "#fb8660",
			"#fc8e63", "#fd9567", "#fd9d6b", "#fda470", "#feac75", "#feb37b", "#febb80", "#fec286",
			"#fec98d", "#fdd193", "#fdd89a", "#fddfa1", "#fce6a8", "#fceeb0", "#fcf5b7", "#fbfcbf"],
		Viridis:[
			"#440154", "#45065a", "#460c5f", "#471265", "#47186a", "#481d6f", "#482273", "#472777",
			"#472c7b", "#46317e", "#453681", "#433b83", "#424085", "#404487", "#3e4989", "#3c4d8a",
			"#3a528b", "#38568b", "#365a8c", "#345e8d", "#32628d", "#31668d", "#2f6a8d", "#2d6e8e",
			"#2c728e", "#2a768e", "#287a8e", "#277d8e", "#26818e", "#24858d", "#23898d", "#218c8d",
			"#1f938b", "#1e978a", "#1e9a89", "#1e9e88", "#1fa286", "#21a685", "#23a982", "#27ad80",
			"#2bb17d", "#30b47a", "#36b877", "#3dbb74", "#44be70", "#4bc26c", "#53c567", "#5bc862",
			"#64cb5d", "#6dce58", "#77d052", "#81d34c", "#8bd546", "#95d73f", "#9fd938", "#aadb32",
			"#b5dd2b", "#bfdf24", "#cae01e", "#d4e11a", "#dfe318", "#e9e419", "#f3e51e", "#fde724"]
	}, // end of sequential

	diverging:{
		Cividis: [
			"#00214E", "#002352", "#002656", "#00285A", "#002B5E", "#002D62", "#003067", "#00336B",
			"#04356E", "#14386E", "#1D3B6D", "#243E6D", "#2A416D", "#30436D", "#35466D", "#3A496E",
			"#3E4C6E", "#434F6F", "#47526F", "#4B5570", "#4F5871", "#535B71", "#575E72", "#5B6173",
			"#5F6474", "#626775", "#666A75", "#6A6D76", "#6E7077", "#717378", "#757679", "#79797B",
			"#807F7C", "#84827B", "#88857B", "#8C897A", "#908C7A", "#958F79", "#999279", "#9D9678",
			"#A19977", "#A59C76", "#AAA076", "#AEA375", "#B2A774", "#B6AA72", "#BAAD71", "#BFB170",
			"#C3B46E", "#C7B86D", "#CBBB6B", "#CFBF69", "#D4C267", "#D8C665", "#DCC962", "#E0CD60",
			"#E5D05D", "#E9D45A", "#EDD756", "#F2DB53", "#F6DE4E", "#FAE24A", "#FFE545", "#FFE93F"],
		BlueRed2:[
			"#4A6FE3", "#5173E2", "#5876E2", "#5E7AE1", "#637EE1", "#6981E1", "#6E85E1", "#7388E1",
			"#788CE1", "#7D8FE1", "#8293E1", "#8797E1", "#8B9AE1", "#909EE1", "#94A1E2", "#99A5E2",
			"#9DA8E2", "#A2ACE2", "#A6B0E2", "#ABB3E2", "#AFB7E2", "#B3BAE3", "#B8BEE3", "#BCC2E3",
			"#C0C5E3", "#C5C9E3", "#C9CDE3", "#CDD0E3", "#D2D4E3", "#D6D8E3", "#DADBE3", "#DFDFE2",
			"#E3DEDF", "#E4D9DB", "#E4D4D7", "#E5D0D3", "#E5CBCF", "#E5C6CB", "#E6C1C7", "#E6BCC4",
			"#E6B8C0", "#E6B3BC", "#E6AEB8", "#E5A9B4", "#E5A4B0", "#E59FAD", "#E49AA9", "#E496A5",
			"#E391A1", "#E38C9E", "#E2879A", "#E18296", "#E07D92", "#DF788F", "#DE738B", "#DD6D87",
			"#DC6884", "#DB6380", "#DA5D7C", "#D85878", "#D75275", "#D64C71", "#D4466E", "#D33F6A"],
		BlueYellow3:[
			"#9FA2FF", "#A4A7FF", "#A8ABFF", "#ACAFFF", "#B1B3FF", "#B4B7FF", "#B8BBFF", "#BCBEFF",
			"#C0C2FF", "#C3C5FF", "#C6C9FF", "#CACCFF", "#CDCFFF", "#D0D2FF", "#D2D4FF", "#D5D7FF",
			"#D8D9FF", "#DADCFF", "#DCDEFF", "#DEE0FF", "#E0E2FF", "#E2E4FF", "#E4E5FF", "#E6E7FF",
			"#E7E8FF", "#E9EAFF", "#EAEBFF", "#EBECFF", "#ECEDFF", "#EDEEFF", "#EEEFFF", "#EFEFFF",
			"#F4F1E0", "#F5F1D8", "#F5F1D2", "#F6F1CC", "#F6F0C7", "#F6F0C2", "#F5EFBD", "#F5EEB9",
			"#F4EDB4", "#F3ECAF", "#F2EAAA", "#F1E9A5", "#F0E7A0", "#EEE59B", "#ECE496", "#EBE191",
			"#E9DF8C", "#E6DD86", "#E4DA80", "#E2D87A", "#DFD574", "#DCD26D", "#DACF67", "#D7CC5F",
			"#D4C958", "#D0C54F", "#CDC246", "#C9BE3C", "#C6BA30", "#C2B620", "#BEB202", "#BAAE00"],
		RedGreen:[
			"#841859", "#8D2160", "#962968", "#A03070", "#AA3778", "#B43E80", "#BD4487", "#C74B8F",
			"#D05296", "#D55C9D", "#DA65A3", "#DF6FA9", "#E378AE", "#E880B4", "#EC89BA", "#F091BF",
			"#F499C5", "#F7A0CA", "#FAA8CF", "#FDAFD4", "#FFB6D8", "#FFBDDD", "#FFC4E1", "#FFCAE5",
			"#FFD0E8", "#FFD6EC", "#FFDCEF", "#FFE1F1", "#FFE6F4", "#FFEBF5", "#FFEFF7", "#FDF3F7",
			"#F1F7F1", "#EAF7EB", "#E4F6E4", "#DEF4DE", "#D7F2D7", "#D0F0D0", "#C9EDC9", "#C1E9C2",
			"#BAE6BA", "#B2E2B2", "#A9DEAA", "#A1D9A2", "#98D499", "#90D090", "#86CA87", "#7DC57E",
			"#73C074", "#69BA6A", "#5FB460", "#53AE55", "#47A849", "#3AA23C", "#2A9B2C", "#139517",
			"#008D07", "#008500", "#007E00", "#007600", "#006E00", "#006600", "#005E00", "#005600"],
		Tropic:[
			"#009B9F", "#009EA2", "#00A0A4", "#00A3A6", "#00A5A9", "#00A8AB", "#00ABAE", "#00ADB0",
			"#00B0B3", "#24B2B5", "#39B5B8", "#48B8BA", "#55BABD", "#60BDBF", "#6BC0C2", "#74C2C5",
			"#7DC5C7", "#86C8CA", "#8ECACC", "#96CDCF", "#9ED0D1", "#A5D2D4", "#ADD5D7", "#B4D8D9",
			"#BBDBDC", "#C2DDDE", "#C9E0E1", "#D0E3E4", "#D7E6E6", "#DDE9E9", "#E4EBEC", "#EBEEEE",
			"#F0EDEF", "#EFE8EC", "#EDE4EA", "#ECDFE8", "#EBDBE5", "#EAD6E3", "#E9D2E1", "#E8CDDE",
			"#E6C9DC", "#E5C4DA", "#E4C0D8", "#E3BBD5", "#E1B7D3", "#E0B2D1", "#DFAECF", "#DEA9CC",
			"#DCA5CA", "#DBA0C8", "#DA9CC6", "#D897C4", "#D793C1", "#D58EBF", "#D489BD", "#D385BB",
			"#D180B9", "#D07BB7", "#CE76B4", "#CD72B2", "#CC6DB0", "#CA68AE", "#C962AC", "#C75DAA"]
	} // end of diverging
}; // end of palettes


/**
 * A generic linear map of [0,1] -> [0..n]
 */
function linear_colormap( normalized_value, pal=palettes.sequential.gray, ...outlier_colors ) {

	var color = pal[ Math.floor( (pal.length-1) * normalized_value ) ];

	// Explicitly handle out of range values similarly to matplotlib:
	// Map values < 0.0 to outlier_colors[0], > 1.0 to outlier_colors[1].

	if( color === undefined ) {
		if( normalized_value < 0 ) {
			color = outlier_colors.length > 0 ? outlier_colors[0] : pal[ 0                ];
		} else {
			color = outlier_colors.length > 1 ? outlier_colors[1] : pal[ pal.length-1 ];
		}
	}

	return color;
}


/**
 * Required:
 * 1. configuration MUST define color as a function.
 * 2. feature.row _must_ be defined as it effectively defines the heatmap!
 */
function renderCell( feature, bpStart, xScale, pixelHeight, ctx, options ) {

	try {

		ctx.save()

		ctx.fillStyle   = this.colorFn( feature );
		ctx.strokeStyle = ctx.fillStyle;

		const h = this.height / this.maxRows;
		const py = (this.maxRows - feature.row - 1) * h;

		const pixelWidth = options.pixelWidth   // typical 3*viewportWidth
		const coord = calculateFeatureCoordinates( feature, bpStart, xScale )
		const xLeft  = Math.max( 0, coord.px )
		const xRight = Math.min( pixelWidth, coord.px1 )

		ctx.fillRect( xLeft, py, xRight - xLeft, h )

	} finally {
		ctx.restore()
	}
}


export {
	palettes,
	linear_colormap, 
	renderCell
}

