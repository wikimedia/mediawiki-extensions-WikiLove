<template>
	<div id="mw-wikilove-overlay" class="wikilove-dialog" tabindex="-1">
		<div class="wikilove-transparent-overlay"></div>
		<div class="wikilove-dialog-body">
			<header class="wikilove-dialog-titlebar">
				<strong>{{ $i18n( 'wikilove-dialog-title' )}}</strong>
				<cdx-icon @click="$emit( 'close' )" :icon="closeIcon" />
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
					<p><a target="_blank" href="{{ $i18n( 'wikilove-what-is-this-link' ) }}">
						{{ $i18n( 'wikilove-what-is-this' ) }}
					</a></p>
					<p id="mw-wikilove-anon-warning"><strong>{{ $i18n( 'wikilove-anon-warning' ) }}</strong></p>
				</div>
				<div id="mw-wikilove-add-details">
					<span class="mw-wikilove-number">2</span>
					<h3>{{ $i18n( 'wikilove-add-details' ) }}</h3>
					<form id="mw-wikilove-preview-form">
						<div id="mw-wikilove-image-preview">
							<div id="mw-wikilove-image-preview-spinner" class="mw-wikilove-spinner"></div>
							<div id="mw-wikilove-image-preview-content"></div>
						</div>
						<label for="mw-wikilove-subtype" id="mw-wikilove-subtype-label"></label>
						<select id="mw-wikilove-subtype"></select>
						<div id="mw-wikilove-subtype-description"></div>
						<label id="mw-wikilove-gallery-label">{{ $i18n( 'wikilove-select-image' ) }}</label>
						<div id="mw-wikilove-gallery">
							<div id="mw-wikilove-gallery-error">
								{{ $i18n( 'wikilove-err-gallery' ) }}
								<a href="#" id="mw-wikilove-gallery-error-again">{{ $i18n( 'wikilove-err-gallery-again' ) }}</a>
							</div>
							<div id="mw-wikilove-gallery-spinner" class="mw-wikilove-spinner"></div>
							<div id="mw-wikilove-gallery-content"></div>
						</div>
						<label for="mw-wikilove-header" id="mw-wikilove-header-label">{{ $i18n( 'wikilove-header' ) }}</label>
						<input type="text" class="text" id="mw-wikilove-header"/>
						<label for="mw-wikilove-title" id="mw-wikilove-title-label">{{ $i18n( 'wikilove-title' ) }}</label>
						<input type="text" class="text" id="mw-wikilove-title"/>
						<label for="mw-wikilove-image" id="mw-wikilove-image-label">{{ $i18n( 'wikilove-image' ) }}</label>
						<span class="mw-wikilove-note" id="mw-wikilove-image-note">{{ $i18n( 'wikilove-image-example' ) }}</span>
						<input type="text" class="text" id="mw-wikilove-image" @change="onImageChange" />
						<div id="mw-wikilove-commons-text" v-html="commonsText"></div>
						<label for="mw-wikilove-message" id="mw-wikilove-message-label">{{ $i18n( 'wikilove-enter-message' ) }}</label>
						<span class="mw-wikilove-note" id="mw-wikilove-message-note">{{ $i18n( 'wikilove-omit-sig' ) }}</span>
						<textarea id="mw-wikilove-message" rows="4"></textarea>
						<div id="mw-wikilove-notify">
							<input type="checkbox" id="mw-wikilove-notify-checkbox" name="notify"/>
							<label for="mw-wikilove-notify-checkbox">{{ $i18n( 'wikilove-notify' ) }}</label>
						</div>
						<button class="submit mw-ui-button mw-ui-progressive" id="mw-wikilove-button-preview" type="submit"></button>
						<div id="mw-wikilove-preview-spinner" class="mw-wikilove-spinner"></div>
					</form>
				</div>
				<div id="mw-wikilove-preview">
					<span class="mw-wikilove-number">3</span>
					<h3>{{ $i18n( 'wikilove-preview' ) }}</h3>
					<div id="mw-wikilove-preview-area"></div>
					<div id="mw-wikilove-terms" v-html="terms"></div>
					<form id="mw-wikilove-send-form">
						<button class="submit mw-ui-button mw-ui-progressive" id="mw-wikilove-button-send" type="submit"></button>
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
const { CdxIcon } = require( '@wikimedia/codex' );
const Vue = require( 'vue' );
module.exports = Vue.defineComponent( {
	name: 'WikiLoveDialog',
	emits: [ 'close' ],
	components: {
		cdxIcon: CdxIcon
	},
	props: {
		closeIcon: {
			type: String,
			default: cdxIconClose
		},
		commonsLink: {
			type: String
		},
		termsLink: {
			type: String
		}
	},
	computed: {
		terms() {
			return mw.msg( 'wikilove-terms' ).replace( '$1', this.termsLink );
		},
		commonsText() {
			return mw.msg( 'wikilove-commons-text' ).replace( '$1', this.commonsLink );
		}
	},
	methods: {
		onImageChange: function () {
				$( '#mw-wikilove-dialog' ).find( '.mw-wikilove-error' ).remove();
				$( '#mw-wikilove-preview' ).hide();
		}
	}
} );

</script>

<style lang="less">
@import 'mediawiki.skin.variables.less';

.wikilove-overlay-container {
	position: fixed;
	left: 0;
	top: 0;
	right: 0;
	bottom: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 999;
}


.wikilove-dialog {
	background: #f2f5f7;
	padding: 0.5em 1em;
	border: 1px solid #a2a9b1;
	box-shadow: 0 2px 2px 0 rgba( 0, 0, 0, 0.25 );
	width: 800px;
	font-size: 13px;
}

.wikilove-dialog header {
	border: 1px solid #aed0ea;
	background: #f0f0f0;
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
	z-index: 2;
	position: relative;
}

.wikilove-transparent-overlay {
	opacity: 0.4;
	background: white;
	position: absolute;
	left: 0;
	right: 0;
	top: 0;
	bottom: 0;
}
</style>