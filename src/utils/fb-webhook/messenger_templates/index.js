/**
 * @description
 * @params
 * @returns
 */
export default ({ type, text, buttons, elements, listType }) => {
  const template = {
    type: 'template',
  };

  switch (type) {
    case 'button':
      template.payload = {
        template_type: type,
        text,
        buttons,
      };
      break;

    case 'list':
      template.payload = {
        template_type: type,
        top_element_style: listType === 'compact' ? listType : undefined,
        elements,
        buttons,
      };
      break;

    case 'media':
      template.payload = {
        template_type: type,
        elements,
      };
      break;

    default:
      template.payload = {};
      break;
  }

  return template;
};
