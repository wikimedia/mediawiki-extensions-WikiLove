<?php
/**
 * MediaWiki WikiLove extension
 * http://www.mediawiki.org/wiki/Extension:WikiLove
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
 * This program is distributed WITHOUT ANY WARRANTY.
 *
 * Heart icon by Mark James (Creative Commons Attribution 3.0 License)
 * Interface design by Brandon Harris
 *
 * @file
 * @ingroup Extensions
 * @author Ryan Kaldari
 * @author Jan Paul Posma
 * @author Sam Reed
 * @licence MIT License
 */

if ( function_exists( 'wfLoadExtension' ) ) {
	wfLoadExtension( 'WikiLove' );
	// Keep i18n globals so mergeMessageFileList.php doesn't break
	$wgMessagesDirs['WikiLove'] = __DIR__ . '/i18n';
	/*wfWarn(
		'Deprecated PHP entry point used for WikiLove extension. Please use wfLoadExtension instead, ' .
		'see https://www.mediawiki.org/wiki/Extension_registration for more details.'
	);*/
	return;
} else {
	die( 'This version of the WikiLove extension requires MediaWiki 1.25+' );
}