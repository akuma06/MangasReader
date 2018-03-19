import { spy } from 'sinon';
import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { BrowserRouter as Router } from 'react-router-dom';
import renderer from 'react-test-renderer';
import ImageNav from '../../app/components/ImageNav';

Enzyme.configure({ adapter: new Adapter() });

function setup() {
  const imageSet = {
    src: 'C:/test.jpg',
    filename: 'test.jpg'
  }
  const actions = {
    onclick: spy()
  }
  const component = shallow(<ImageNav image={imageSet} page={0} {...actions} />);
  return {
    component,
    imageSet,
    actions,
    link: component.find('a'),
    image: component.find('img'),
    p: component.find('p')
  };
}

describe('ImageNav component', () => {
  it('should display a link', () => {
    const { link, actions } = setup();
    link.at(0).simulate('click', {
      preventDefault: () => {},
      stopPropagation: () => {}
    });
    expect(actions.onclick.called).toBe(true);
  });

  it('should show an image', () => {
    const { image, imageSet } = setup();
    expect(image.prop('src')).toBe(imageSet.src);
  });

  it('should show a text', () => {
    const { p } = setup();
    expect(p.text()).toBe('Page 1');
  });
});
