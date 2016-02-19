@en.wikipedia.beta.wmflabs.org @firefox
Feature: Wikilove

  Background:
    Given I am logged in
    When I visit the User page of Selenium_user2
      And I click Wikilove

  Scenario: Wikilove window appears
    Then Wikilove window appears

  Scenario: Wikilove barnstar options
    When I click Barnstars
    Then I should see the barnstars selectbox
      And I should see the message text field

  Scenario: Wikilove Food and drink options
    When I click Food and drink
    Then I should see the Food and drink selectbox
      And I should see the header text field containing Some baklava for you!
      And I should see the message text field

  Scenario: Wikilove Kittens options
    When I click Kittens
    Then I should be able to select an image
      And I should see the header text field containing A kitten for you!
      And I should see the message text field
