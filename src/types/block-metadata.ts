import LocalQuotes from "../main";
import {parseCodeBlock} from "../utils/parser";
import {getBlockMetadataIdx} from "../utils/scan";
import {getCurrentSeconds} from "../utils/date";
import {searchQuote} from "./quote";

export interface BlockMetadataContent {
	author: string;
	text: string;
}

export interface BlockMetadata {
	id: string;
	search: string;
	content: BlockMetadataContent,
	customClass: string;
	refresh: number;
	lastUpdate: number;
}

function makeBlockMetadata(plugin: LocalQuotes, rawBlockMetadata: BlockMetadata): BlockMetadata {
	rawBlockMetadata.content = searchQuote(plugin.settings.quoteVault, rawBlockMetadata.search);
	rawBlockMetadata.lastUpdate = getCurrentSeconds();

	plugin.settings.blockMetadata.push(rawBlockMetadata);

	return rawBlockMetadata;
}

function updateBlockMetadata(plugin: LocalQuotes, rawBlockMetadata: BlockMetadata): BlockMetadata {
	const bmIdx: number = getBlockMetadataIdx(plugin, rawBlockMetadata.id);
	const prevBm: BlockMetadata = plugin.settings.blockMetadata[bmIdx];

	// Fields updating
	if (prevBm.search !== rawBlockMetadata.search) {
		plugin.settings.blockMetadata[bmIdx].search = rawBlockMetadata.search;
		plugin.settings.blockMetadata[bmIdx].content = searchQuote(plugin.settings.quoteVault, rawBlockMetadata.search);
	}
	if (prevBm.customClass !== rawBlockMetadata.customClass) {
		plugin.settings.blockMetadata[bmIdx].customClass = rawBlockMetadata.customClass;
	}
	if (prevBm.refresh !== rawBlockMetadata.refresh) {
		plugin.settings.blockMetadata[bmIdx].refresh = rawBlockMetadata.refresh;
		plugin.settings.blockMetadata[bmIdx].content = searchQuote(plugin.settings.quoteVault, rawBlockMetadata.search);
	}

	// Update quote
	let refreshInterval = plugin.settings.blockMetadata[bmIdx].refresh === null
		? plugin.settings.defaultReloadInterval
		: plugin.settings.blockMetadata[bmIdx].refresh;

	if ((plugin.settings.blockMetadata[bmIdx].lastUpdate + refreshInterval) < getCurrentSeconds()) {
		plugin.settings.blockMetadata[bmIdx].content = searchQuote(plugin.settings.quoteVault, rawBlockMetadata.search);
		plugin.settings.blockMetadata[bmIdx].lastUpdate = getCurrentSeconds();
	}

	return plugin.settings.blockMetadata[bmIdx];
}

export function selectBlockMetadata(plugin: LocalQuotes, source: string): BlockMetadata {
	let tmpBm: BlockMetadata = parseCodeBlock(source);
	const idx: number = plugin.settings.blockMetadata.findIndex((e) => e.id === tmpBm.id);

	// If author and/or id aren't set
	if (!(tmpBm.id && tmpBm.search) || plugin.settings.quoteVault.length === 0) {
		return {
			content: {
				author: 'Local Quotes',
				text: 'You caught an error! If you can\'t understand what is wrong you can write an issue on GitHub'
			},
			customClass: null, id: null, lastUpdate: 0, refresh: null, search: null
		};
	} else {
		if (idx >= 0) {
			return updateBlockMetadata(plugin, tmpBm);
		} else {
			return makeBlockMetadata(plugin, tmpBm);
		}
	}
}
