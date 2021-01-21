/**
 * @class ButtonList
 * @classdesc
 */
export default class ButtonList {
  /**
   * @constructor
   * @description
   * @param {Array} buttons
   */
  constructor(buttons = []) {
    this.listOfButtons = buttons;
  }

  /**
   * @description
   * @param {*} button
   */
  addButton(button) {
    this.listOfButtons.push(button);
  }

  /**
   * @description
   * @returns {*} Array of buttons
   */
  getButtons() {
    return this.listOfButtons;
  }
}
