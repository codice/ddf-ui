/**
 * Copyright (c) Codice Foundation
 *
 * This is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser
 * General Public License as published by the Free Software Foundation, either version 3 of the
 * License, or any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without
 * even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details. A copy of the GNU Lesser General Public License
 * is distributed along with this program and can be found at
 * <http://www.gnu.org/licenses/lgpl.html>.
 *
 **/
import React from 'react';
import styled from 'styled-components';
import { Visualizations } from '../../component/visualization/visualizations';
const CustomElement = styled.div `
  height: 100%;
  width: 100%;
  display: block;
`;
const Visualization = styled.div `
  opacity: ${(props) => props.theme.minimumOpacity};
  padding: ${(props) => props.theme.largeSpacing};
  :hover {
    opacity: 1;
  }
  white-space: nowrap;
  cursor: move;
`;
const VisualizationIcon = styled.div `
  text-align: center;
  width: ${(props) => props.theme.minimumButtonSize};
  display: inline-block;
  vertical-align: middle;
`;
const VisualizationText = styled.div `
  width: calc(100% - ${(props) => props.theme.minimumButtonSize});
  font-size: ${(props) => props.theme.mediumFontSize};
  overflow: hidden;
  text-overflow: ellipsis;
  display: inline-block;
  vertical-align: middle;
`;
const configs = Visualizations.reduce((cfg, viz) => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'isClosable' does not exist on type 'Visu... Remove this comment to see the full error message
    const { id, title, icon, isClosable = true } = viz;
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    cfg[id] = {
        title,
        type: 'component',
        componentName: id,
        icon,
        componentState: {},
        isClosable,
    };
    return cfg;
}, {});
const unMaximize = (contentItem: any) => {
    if (contentItem.isMaximised) {
        contentItem.toggleMaximise();
        return true;
    }
    else if (contentItem.contentItems.length === 0) {
        return false;
    }
    else {
        return (Array as any).some(contentItem.contentItems, (subContentItem: any) => {
            return unMaximize(subContentItem);
        });
    }
};
class VisualizationSelector extends React.Component {
    cesium: any;
    histogram: any;
    inspector: any;
    interimChoice: any;
    interimState: any;
    openlayers: any;
    table: any;
    dragSources = [];
    constructor(props: any) {
        super(props);
        this.openlayers = React.createRef();
        this.cesium = React.createRef();
        this.inspector = React.createRef();
        this.histogram = React.createRef();
        this.table = React.createRef();
        (this.props as any).goldenLayout.on('stateChanged', () => {
            this.forceUpdate();
        });
    }
    render() {
        (window as any)._gl = (this.props as any).goldenLayout;
        return (<CustomElement data-id="visualization-menu" onClick={this.handleChoice.bind(this)}>
        {Object.values(configs).map(({ title, icon, componentName }, index) => (<Visualization key={index.toString()} ref={(x: any) => {
                    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                    this[componentName] = x;
                }} onMouseDown={this.handleMouseDown.bind(this, componentName)} onMouseUp={this.handleMouseUp.bind(this, componentName)} className={JSON.stringify((this.props as any).goldenLayout.toConfig()).includes(`"componentName":"${componentName}"`)
                    ? '' /** change to hidden to only allow one of each visual */
                    : ''}>
              <VisualizationIcon className={icon}/>
              <VisualizationText>{title}</VisualizationText>
            </Visualization>), this)}
      </CustomElement>);
    }
    componentDidMount() {
        this.dragSources = [];
        // @ts-expect-error ts-migrate(2322) FIXME: Type 'any[]' is not assignable to type 'never[]'.
        this.dragSources = Object.keys(configs).map((key) => (this.props as any).goldenLayout.createDragSource(this[key], configs[key]));
        this.listenToDragSources();
    }
    listenToDragStart(dragSource: any) {
        dragSource._dragListener.on('dragStart', () => {
            this.interimState = false;
        });
    }
    listenToDragStop(dragSource: any) {
        dragSource._dragListener.on('dragStop', () => {
            this.listenToDragStart(dragSource);
            this.listenToDragStop(dragSource);
        });
    }
    listenToDragSources() {
        this.dragSources.forEach((dragSource) => {
            this.listenToDragStart(dragSource);
            this.listenToDragStop(dragSource);
        });
    }
    handleChoice() {
        (this.props as any).onClose();
    }
    // @ts-expect-error ts-migrate(6133) FIXME: 'event' is declared but its value is never read.
    handleMouseDown(event: any, choice: any) {
        unMaximize((this.props as any).goldenLayout.root);
        this.interimState = true;
        this.interimChoice = choice;
    }
    handleMouseUp(choice: any) {
        if (this.interimState) {
            if ((this.props as any).goldenLayout.root.contentItems.length === 0) {
                (this.props as any).goldenLayout.root.addChild({
                    type: 'column',
                    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                    content: [configs[choice]],
                });
            }
            else {
                // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                (this.props as any).goldenLayout.root.contentItems[0].addChild(configs[choice]);
            }
        }
        this.interimState = false;
    }
}
export default VisualizationSelector;
