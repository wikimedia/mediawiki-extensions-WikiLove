#
# This file is subject to the license terms in the COPYING file found in the
# WikiLove top-level directory and at
# https://git.wikimedia.org/blob/mediawiki%2Fextensions%2FWikiLove/HEAD/COPYING. No part of
# WikiLove, including this file, may be copied, modified, propagated, or
# distributed except according to the terms contained in the COPYING file.
#
# Copyright 2012-2014 by the Mediawiki developers. See the CREDITS file in the
# WikiLove top-level directory and at
# https://git.wikimedia.org/blob/mediawiki%2Fextensions%2FWikiLove/HEAD/CREDITS
#
require 'page-object'

class WikilovePage
  include PageObject

  page_url 'User:Selenium_user2'

  select_list(:barnstar_select, id: 'mw-wikilove-subtype')
  span(:barnstars, text: 'Barnstars')
  span(:food_and_drink, text: 'Food and drink')
  select_list(:food_drink_select, id: 'mw-wikilove-subtype')
  text_field(:food_header, id: 'mw-wikilove-header')
  a(:heart, text: 'WikiLove')
  text_field(:kitten_header, id: 'mw-wikilove-header')
  a(:kitten_image, id: 'mw-wikilove-gallery-img-0')
  span(:kittens, text: 'Kittens')
  text_area(:wikilove_message, id: 'mw-wikilove-message')
  div(:wikilove_spinner, id: 'mw-wikilove-image-preview-spinner')
  div(:wikilove_window, class: 'ui-dialog ui-widget ui-widget-content ui-corner-all ui-draggable')
end
