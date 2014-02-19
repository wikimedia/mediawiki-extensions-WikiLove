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
When(/^I click Barnstars$/) do
  on(WikilovePage).barnstars_element.click
end

When(/^I click Food and drink$/) do
  on(WikilovePage).food_and_drink_element.click
end

When(/^I click Kittens$/) do
  on(WikilovePage).kittens_element.click
end

When(/^I click Wikilove$/) do
  on(WikilovePage).heart_element.click
end

When(/^I visit the User page of Selenium_user2$/) do
  visit WikilovePage
end

Then(/^I should be able to select an image$/) do
  on(WikilovePage).kitten_image_element.when_visible.click
end

Then(/^I should see the Food and drink selectbox$/) do
  on(WikilovePage).food_drink_select_element.should be_visible
end

Then(/^I should see the header text field containing (.+)$/) do |wikilove_message|
  on(WikilovePage).food_header.should match Regexp.escape(wikilove_message)
end

Then(/^I should see the barnstars selectbox$/) do
  on(WikilovePage).barnstar_select_element.should be_visible
end

Then(/^I should see the message text field$/) do
  on(WikilovePage).wikilove_message_element.should be_visible
end

Then(/^Wikilove window appears$/) do
  on(WikilovePage).wikilove_window_element.should be_visible
end
