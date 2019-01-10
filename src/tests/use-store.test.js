import React from 'react';
import { shallow, mount } from 'enzyme';
import { createStore, useStore } from '..';

describe('useStore', () => {
  const store = createStore({state: 0, name: '1'});

  beforeEach(() => {
    store.setState(0);
  });

  it('Should throw an error if an inexistent store is referenced', () => {
    const Component = (props) => {
      useStore('Unreal Store');

      return <div>Hi</div>;
    }

    expect(() => {
      shallow(<Component />);
    }).toThrow();
  });

  it('Should provide the component with a functional state and setState pair', () => {
    const Component = (props) => {
      const [state, setState] = useStore('1');

      return (
        <button onClick={() => setState(state+1)}>
          This button has been clicked {state} times
        </button>
      );
    }

    const rendered = mount(<Component />);
    expect(rendered.text()).toBe('This button has been clicked 0 times');
    rendered.find('button').simulate('click');
    expect(rendered.text()).toBe('This button has been clicked 1 times');
    rendered.find('button').simulate('click');
    expect(rendered.text()).toBe('This button has been clicked 2 times');
  });

  it('Should provide the component with correct store based on class identifier', () => {
    const Component = (props) => {
      const [state, setState] = useStore(store);

      return (
        <button onClick={() => setState(state+1)}>
          This button has been clicked {state} times
        </button>
      );
    }

    const rendered = mount(<Component />);
    expect(rendered.text()).toBe('This button has been clicked 0 times');
    rendered.find('button').simulate('click');
    expect(rendered.text()).toBe('This button has been clicked 1 times');
    rendered.find('button').simulate('click');
    expect(rendered.text()).toBe('This button has been clicked 2 times');
  });

  it('Should update all components if setState is called from anywhere', () => {
    const Component = (props) => {
      const [state, setState] = useStore('1');

      return (
        <button onClick={() => setState(state+1)}>
          This button has been clicked {state} times
        </button>
      );
    }

    const AnotherComponent = (props) => {
      const [state] = useStore('1');

      return (
        <div>
          {state}
        </div>
      );
    }

    const renderedComponent = mount(<Component />);
    const renderedAnotherComponent = mount(<AnotherComponent />);

    expect(renderedComponent.text()).toBe('This button has been clicked 0 times');
    expect(renderedAnotherComponent.text()).toBe('0');
    renderedComponent.find('button').simulate('click');
    expect(renderedComponent.text()).toBe('This button has been clicked 1 times');
    expect(renderedAnotherComponent.text()).toBe('1');
    store.setState('Hello');
    expect(renderedComponent.text()).toBe('This button has been clicked Hello times');
    expect(renderedAnotherComponent.text()).toBe('Hello');
  });

  test('Different stores work in hamorny', () => {
    const countStore = createStore({name: 'countStore', state: 0});
    const nameStore = createStore({name: 'nameStore', state: ''});

    const HelloWorld = (props) => {
      const [name] = useStore(nameStore);
      const [count] = useStore(countStore);

      return (
        <div>Hello, {name}! you have been here {count} times!</div>
      )
    };

    const rendered = mount(<HelloWorld />);
    expect(rendered.text()).toBe('Hello, ! you have been here 0 times!');

    countStore.setState(1);
    expect(rendered.text()).toBe('Hello, ! you have been here 1 times!');

    nameStore.setState('Richard');
    expect(rendered.text()).toBe('Hello, Richard! you have been here 1 times!');
  })
});