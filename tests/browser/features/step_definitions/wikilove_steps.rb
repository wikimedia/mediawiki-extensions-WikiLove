#
# This file is subject to the license terms in the COPYING file found in the
# WikiLove top-level directory and at
# https://phabricator.wikimedia.org/diffusion/EWLO/browse/master/COPYING. No part of
# WikiLove, including this file, may be copied, modified, propagated, or
# distributed except according to the terms contained in the COPYING file.
#
# Copyright 2012-2014 by the Mediawiki developers. See the CREDITS file in the
# WikiLove top-level directory and at
# https://phabricator.wikimedia.org/diffusion/EWLO/browse/master/CREDITS
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
  expect(on(WikilovePage).food_drink_select_element).to be_visible
end

Then(/^I should see the header text field containing (.+)$/) do |wikilove_message|
  expect(on(WikilovePage).food_header).to match Regexp.escape(wikilove_message)
end

Then(/^I should see the barnstars selectbox$/) do
  expect(on(WikilovePage).barnstar_select_element).to be_visible
end

Then(/^I should see the message text field$/) do
  expect(on(WikilovePage).wikilove_message_element).to be_visible
end

Then(/^Wikilove window appears$/) do
  expect(on(WikilovePage).wikilove_window_element).to be_visible
end
