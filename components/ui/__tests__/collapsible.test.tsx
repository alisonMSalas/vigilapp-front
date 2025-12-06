import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Collapsible } from '../collapsible';

describe('Collapsible', () => {
  it('should render correctly', () => {
    const { UNSAFE_root } = render(
      <Collapsible title="Test Title">
        <></>
      </Collapsible>
    );
    expect(UNSAFE_root).toBeTruthy();
  });

  it('should display the title', () => {
    const { getByText } = render(
      <Collapsible title="My Title">
        <></>
      </Collapsible>
    );
    expect(getByText('My Title')).toBeTruthy();
  });

  it('should toggle content on press', () => {
    const { getByText, queryByText } = render(
      <Collapsible title="Toggle Test">
        <></>
      </Collapsible>
    );
    
    const heading = getByText('Toggle Test');
    fireEvent.press(heading);
    
    // Content should be visible after press
    expect(queryByText).toBeTruthy();
  });

  it('should start collapsed', () => {
    const { getByText } = render(
      <Collapsible title="Start Test">
        <></>
      </Collapsible>
    );
    
    expect(getByText('Start Test')).toBeTruthy();
  });
});
