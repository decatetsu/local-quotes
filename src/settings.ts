import { Notice, PluginSettingTab, Setting } from "obsidian";
import LocalQuotes from "./main";
import { BlockMetadata } from "./types/block-metadata";
import { sec_in_day } from "./consts";
import { OneTimeBlock } from "./types/one-time-block";
import { Quote } from "./types/quote";

export interface LocalQuotesSettings {
  quoteTag: string;
  defaultReloadInterval: number;
  minimalQuoteLength: number;
  autoGeneratedIdLength: number;
  inheritListingStyle: boolean;
  updateFilesQuotesOnModify: boolean;
  quoteBlockFormat: string;
  usePlainFormat: boolean;
  useWeightedRandom: boolean;
  blockMetadata: BlockMetadata[];
  oneTimeBlocks: OneTimeBlock[];
  quoteVault: Quote[];
  templateFolder: string;
  hideRefreshButton: boolean;
  displayWarnings: boolean;
  enableDblClick: boolean;
  useAutomaticRefreshInterval: boolean;
  automaticRefreshInterval: number;
  _automaticRefreshIntervalObject: ReturnType<typeof setInterval> | number;
}

export const DEFAULT_SETTINGS: LocalQuotesSettings = {
  quoteTag: "quotes",
  defaultReloadInterval: sec_in_day,
  minimalQuoteLength: 5,
  autoGeneratedIdLength: 5,
  inheritListingStyle: false,
  updateFilesQuotesOnModify: true,
  quoteBlockFormat: "{{content}}\n— {{author}}",
  usePlainFormat: false,
  useWeightedRandom: false,
  blockMetadata: [],
  oneTimeBlocks: [],
  quoteVault: [],
  templateFolder: "",
  hideRefreshButton: false,
  displayWarnings: true,
  enableDblClick: true,
  useAutomaticRefreshInterval: true,
  automaticRefreshInterval: 1000,
  _automaticRefreshIntervalObject: null,
};

export class LocalQuotesSettingTab extends PluginSettingTab {
  plugin: LocalQuotes;

  constructor(plugin: LocalQuotes) {
    super(plugin.app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    containerEl.createEl("h2", { text: "General" });

    new Setting(containerEl)
      .setName("Use automatic refresh interval")
      .setDesc(
        "If you turn it on, your quotes will be refreshed automatically without reopening the note"
      )
      .addToggle((t) =>
        t
          .setValue(this.plugin.settings.useAutomaticRefreshInterval)
          .onChange(async (value) => {
            this.plugin.settings.useAutomaticRefreshInterval = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Quote tag")
      .setDesc("Tag name that will be used for searching notes with quotes")
      .addText((text) =>
        text
          .setPlaceholder(DEFAULT_SETTINGS.quoteTag)
          .setValue(this.plugin.settings.quoteTag)
          .onChange(async (value) => {
            this.plugin.settings.quoteTag = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Refresh interval")
      .setDesc(
        "You can set default refresh interval (in seconds) and miss corresponding field in code block" +
          " (default 86400 seconds equals 1 day)"
      )
      .addText((text) =>
        text
          .setPlaceholder(DEFAULT_SETTINGS.defaultReloadInterval.toString())
          .setValue(this.plugin.settings.defaultReloadInterval.toString())
          .onChange(async (value) => {
            this.plugin.settings.defaultReloadInterval = parseInt(value);
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Template folder")
      .setDesc("Folder that will be ignored by one-time quotes")
      .addText((text) =>
        text
          .setPlaceholder(DEFAULT_SETTINGS.templateFolder)
          .setValue(this.plugin.settings.templateFolder)
          .onChange(async (value) => {
            this.plugin.settings.templateFolder = value;
            await this.plugin.saveSettings();
          })
      );

    containerEl.createEl("h3", { text: "Style" });

    new Setting(containerEl)
      .setName("Inherit listing's authors' style")
      .setDesc(
        "You can use style in your listings like `:::**Author**:::`, if this setting turns on, your " +
          "quote blocks will inherit this styling"
      )
      .addToggle((t) =>
        t
          .setValue(this.plugin.settings.inheritListingStyle)
          .onChange(async (value) => {
            this.plugin.settings.inheritListingStyle = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Quote block format")
      .setDesc(
        "Set your own format for quote blocks. Use {{content}} and {{author}} placeholders to place data"
      )
      .addTextArea((text) =>
        text
          .setPlaceholder(DEFAULT_SETTINGS.quoteBlockFormat)
          .setValue(this.plugin.settings.quoteBlockFormat)
          .onChange(async (value) => {
            this.plugin.settings.quoteBlockFormat = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Use plain format")
      .setDesc(
        'If you turn it on, your quotes will be placed in a simple div block without "quote" appearance' +
          ", it'll be placed as plain text"
      )
      .addToggle((st) =>
        st
          .setValue(this.plugin.settings.usePlainFormat)
          .onChange(async (value) => {
            this.plugin.settings.usePlainFormat = value;
            await this.plugin.saveSettings();
          })
      );

    containerEl.createEl("h2", { text: "Advanced" });

    new Setting(containerEl)
      .setName("Hide refresh button")
      .setDesc("If you turn it on, refresh button will disappear constantly.")
      .addToggle((t) =>
        t
          .setValue(this.plugin.settings.hideRefreshButton)
          .onChange(async (value) => {
            this.plugin.settings.hideRefreshButton = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Handle double click on mobile")
      .setDesc(
        "If you turn it on, you can refresh quote block just with twice tap on it. Refresh button will " +
          "disappear (only on mobile)."
      )
      .addToggle((t) =>
        t
          .setValue(this.plugin.settings.enableDblClick)
          .onChange(async (value) => {
            this.plugin.settings.enableDblClick = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Use weighted random")
      .setDesc(
        "If you turn it on, plugin will use weighted random strategy so then more quotes author has then" +
          " more probability of choosing exactly this author."
      )
      .addToggle((t) =>
        t
          .setValue(this.plugin.settings.useWeightedRandom)
          .onChange(async (value) => {
            this.plugin.settings.useWeightedRandom = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Automatically update quote listing")
      .setDesc(
        "If you turn it on plugin will scan your file for new quotes when you modify it. Requires app " +
          "relaunch to apply setting change"
      )
      .addToggle((t) =>
        t
          .setValue(this.plugin.settings.updateFilesQuotesOnModify)
          .onChange(async (value) => {
            this.plugin.settings.updateFilesQuotesOnModify = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Minimum quote length")
      .setDesc("Quotes shorter than this length will not be included")
      .addText((text) =>
        text
          .setPlaceholder(DEFAULT_SETTINGS.minimalQuoteLength.toString())
          .setValue(this.plugin.settings.minimalQuoteLength.toString())
          .onChange(async (value) => {
            this.plugin.settings.minimalQuoteLength = parseInt(value);
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Auto generated id length")
      .setDesc(
        "This setting affects on length of id that automatically generates in 'Quote Maker'"
      )
      .addText((text) =>
        text
          .setPlaceholder(DEFAULT_SETTINGS.autoGeneratedIdLength.toString())
          .setValue(this.plugin.settings.autoGeneratedIdLength.toString())
          .onChange(async (value) => {
            this.plugin.settings.autoGeneratedIdLength = parseInt(value);
            await this.plugin.saveSettings();
          })
      );

    containerEl.createEl("h2", { text: "Danger Zone" });

    new Setting(containerEl)
      .setName("Automatic refresh interval")
      .setDesc(
        "You can set default automatic refresh interval (in miliseconds)"
      )
      .addText((text) =>
        text
          .setPlaceholder(DEFAULT_SETTINGS.automaticRefreshInterval.toString())
          .setValue(this.plugin.settings.automaticRefreshInterval.toString())
          .onChange(async (value) => {
            this.plugin.settings.automaticRefreshInterval = parseInt(value);
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Display warnings")
      .setDesc(
        "If you turn it on plugin will display any warning those need your attention in the developer " +
          "console. If it's annoying and you don't agree with warnings or will not fix them, you can disable " +
          "this option."
      )
      .addToggle((t) =>
        t
          .setValue(this.plugin.settings.displayWarnings)
          .onChange(async (value) => {
            this.plugin.settings.displayWarnings = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Clear block metadata")
      .setDesc(
        "Set blockMetadata property to empty array (use if you have problems with old quote occurrence)"
      )
      .addButton((btn) =>
        btn.setButtonText("Clear").onClick(async () => {
          this.plugin.settings.blockMetadata = [];
          await this.plugin.saveSettings();
          new Notice("Your block metadata successfully cleared!");
        })
      );

    new Setting(containerEl)
      .setName("Clear one-time blocks")
      .setDesc(
        "Set oneTimeBlocks property to empty array (use if you have problems with " +
          "mismatched template folder)"
      )
      .addButton((btn) =>
        btn.setButtonText("Clear").onClick(async () => {
          this.plugin.settings.oneTimeBlocks = [];
          await this.plugin.saveSettings();
          new Notice("Your one-time blocks successfully cleared!");
        })
      );
  }
}
