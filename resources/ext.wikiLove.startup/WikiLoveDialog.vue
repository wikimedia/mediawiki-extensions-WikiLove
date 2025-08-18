<template>
	<div
		id="mw-wikilove-overlay"
		class="wikilove-dialog"
		tabindex="-1"
	>
		<div class="wikilove-transparent-overlay"></div>
		<div class="wikilove-dialog-body">
			<header class="wikilove-dialog-titlebar">
				<strong>{{ $i18n( 'wikilove-dialog-title' ) }}</strong>
				<cdx-icon :icon="closeIcon" @click="$emit( 'close' )"></cdx-icon>
			</header>
			<div id="mw-wikilove-dialog">
				<div id="mw-wikilove-select-type">
					<span class="mw-wikilove-number">1</span>
					<h3>{{ $i18n( 'wikilove-select-type' ) }}</h3>
					<ul id="mw-wikilove-types"></ul>
				</div>
				<div id="mw-wikilove-get-started">
					<h2><span id="mwe-wikilove-pointer-arrow"></span>{{ $i18n( 'wikilove-get-started-header' ) }}</h2>
					<ol>
						<li>{{ $i18n( 'wikilove-get-started-list-1' ) }}</li>
						<li>{{ $i18n( 'wikilove-get-started-list-2' ) }}</li>
						<li>{{ $i18n( 'wikilove-get-started-list-3' ) }}</li>
					</ol>
					<p>
						<a target="_blank" :href="whatIsThisLink">
							{{ $i18n( 'wikilove-what-is-this' ) }}
						</a>
					</p>
					<p id="mw-wikilove-anon-warning">
						<strong>{{ $i18n( 'wikilove-anon-warning' ) }}</strong>
					</p>
				</div>
				<div id="mw-wikilove-add-details">
					<span class="mw-wikilove-number">2</span>
					<h3>{{ $i18n( 'wikilove-add-details' ) }}</h3>
					<form id="mw-wikilove-preview-form">
						<div id="mw-wikilove-image-preview">
							<div id="mw-wikilove-image-preview-spinner" class="mw-wikilove-spinner"></div>
							<div id="mw-wikilove-image-preview-content"></div>
						</div>
						<label id="mw-wikilove-subtype-label" for="mw-wikilove-subtype"></label>
						<select id="mw-wikilove-subtype"></select>
						<div id="mw-wikilove-subtype-description"></div>
						<label id="mw-wikilove-gallery-label">{{ $i18n( 'wikilove-select-image' ) }}</label>
						<div id="mw-wikilove-gallery">
							<div id="mw-wikilove-gallery-error">
								{{ $i18n( 'wikilove-err-gallery' ) }}
								<a id="mw-wikilove-gallery-error-again" href="#">{{ $i18n( 'wikilove-err-gallery-again' ) }}</a>
							</div>
							<div id="mw-wikilove-gallery-spinner" class="mw-wikilove-spinner"></div>
							<div id="mw-wikilove-gallery-content"></div>
						</div>
						<label id="mw-wikilove-header-label" for="mw-wikilove-header">{{ $i18n( 'wikilove-header' ) }}</label>
						<input
							id="mw-wikilove-header"
							type="text"
							class="text"
						>
						<label id="mw-wikilove-title-label" for="mw-wikilove-title">{{ $i18n( 'wikilove-title' ) }}</label>
						<input
							id="mw-wikilove-title"
							type="text"
							class="text"
						>
						<label id="mw-wikilove-image-label" for="mw-wikilove-image">{{ $i18n( 'wikilove-image' ) }}</label>
						<span id="mw-wikilove-image-note" class="mw-wikilove-note">{{ $i18n( 'wikilove-image-example' ) }}</span>
						<input
							id="mw-wikilove-image"
							type="text"
							class="text"
							@change="onImageChange"
						>
						<!-- eslint-disable-next-line vue/no-v-html -->
						<div id="mw-wikilove-commons-text" v-html="commonsText"></div>
						<label id="mw-wikilove-message-label" for="mw-wikilove-message">{{ $i18n( 'wikilove-enter-message' ) }}</label>
						<span id="mw-wikilove-message-note" class="mw-wikilove-note">{{ $i18n( 'wikilove-omit-sig' ) }}</span>
						<textarea id="mw-wikilove-message" rows="4"></textarea>
						<div id="mw-wikilove-notify">
							<input
								id="mw-wikilove-notify-checkbox"
								type="checkbox"
								name="notify"
							>
							<label for="mw-wikilove-notify-checkbox">{{ $i18n( 'wikilove-notify' ) }}</label>
						</div>

						<cdx-button
							id="mw-wikilove-button-preview"
							class="submit"
							action="progressive">
							{{ $i18n( 'wikilove-button-preview' ) }}
						</cdx-button>
						<div id="mw-wikilove-preview-spinner" class="mw-wikilove-spinner"></div>
					</form>
				</div>
				<div id="mw-wikilove-preview">
					<span class="mw-wikilove-number">3</span>
					<h3>{{ $i18n( 'wikilove-preview' ) }}</h3>
					<div id="mw-wikilove-preview-area"></div>
					<!-- eslint-disable-next-line vue/no-v-html -->
					<div id="mw-wikilove-terms" v-html="terms"></div>
					<form id="mw-wikilove-send-form">
						<cdx-button
							id="mw-wikilove-button-send"
							class="submit"
							action="progressive">
							{{ $i18n( 'wikilove-button-send' ) }}
						</cdx-button>
						<div id="mw-wikilove-send-spinner" class="mw-wikilove-spinner"></div>
					</form>
					<div id="mw-wikilove-success"></div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
const { cdxIconClose } = require( './icons.json' );
const { whatIsThisLink } = require( './data.json' );
const { CdxIcon, CdxButton } = require( '@wikimedia/codex' );
const Vue = require( 'vue' );

// @vue/component
module.exports = Vue.defineComponent( {
	name: 'WikiLoveDialog',
	components: {
		CdxButton,
		CdxIcon,
	},
	props: {
		closeIcon: {
			type: String,
			default: cdxIconClose,
		},
		commonsLink: {
			type: String,
			required: true,
		},
		termsLink: {
			type: String,
			required: true,
		},
	},
	emits: [ 'close' ],
	data: () => ( {
		whatIsThisLink,
	} ),
	computed: {
		terms() {
			// TODO improve this logic so that v-html isn't needed
			return mw.message( 'wikilove-terms' ).parse().replace( '$1', this.termsLink );
		},
		commonsText() {
			// TODO improve this logic so that v-html isn't needed
			return mw.message( 'wikilove-commons-text' ).parse().replace( '$1', this.commonsLink );
		},
	},
	methods: {
		onImageChange: function () {
			// FIXME jQuery should not be used here, this showing and hiding should be done through Vue
			/* eslint-disable no-jquery/no-global-selector */
			$( '#mw-wikilove-dialog' ).find( '.mw-wikilove-error' ).remove();
			$( '#mw-wikilove-preview' ).hide();
			/* eslint-enable no-jquery/no-global-selector */
		},
	},
} );

</script>

<style lang="less">
@import 'mediawiki.skin.variables.less';

.wikilove-overlay-container {
	position: absolute;
	left: 0;
	top: 0;
	right: 0;
	bottom: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: @z-index-overlay-backdrop;
}

.wikilove-dialog {
	background: @background-color-neutral-subtle;
	padding: 0.5em 1em;
	border: @border-base;
	box-shadow: 0 2px 2px 0 rgba( 0, 0, 0, 0.25 );
	width: 800px;
	font-size: 13px;
	margin: auto;
}

.wikilove-dialog header {
	border: 1px solid #aed0ea;
	background: @background-color-neutral;
	padding: 0.9em 1.4em 0.6em;
	font-weight: bold;
	display: flex;
	align-items: center;

	strong {
		flex-grow: 1;
	}

	.cdx-icon {
		cursor: pointer;
	}
}

.wikilove-dialog-body {
	position: relative;
	z-index: @z-index-stacking-2;
}

.wikilove-transparent-overlay {
	opacity: @opacity-medium;
	background: @background-color-base;
	position: absolute;
	left: 0;
	right: 0;
	top: 0;
	bottom: 0;
}
</style>
