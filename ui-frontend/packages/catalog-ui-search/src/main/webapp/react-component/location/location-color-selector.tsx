/* Copyright (c) Connexta, LLC */
import * as React from 'react'
import styled from 'styled-components'
import { Grid } from '@mui/material'
import Tooltip from '@mui/material/Tooltip/Tooltip'
import { transparentize } from 'polished'

const ColorSwatch = styled.button`
  height: 1.5rem;
  width: 1.5rem;
  min-width: 1.5rem;
  margin: 0.2rem;
  border-radius: 4px;
  background-color: ${(props: any) => props.color};
`

export const ColorSquare = styled(ColorSwatch)`
  height: ${(props: any) => props.size};
  width: ${(props: any) => props.size};
  min-width: ${(props: any) => props.size};
  background-color: ${(props: any) => props.color};
  border-radius: 4px;
  background-clip: padding-box;
  &:enabled {
    border: 0.12rem solid
      ${(props: any) => transparentize(0.5, props.palette.text.primary)};
  }
  &:enabled:hover {
    border: 0.15rem solid
      ${(props: any) => transparentize(0.1, props.palette.text.primary)};
  }
`

const ColorGrid = styled(Grid)`
  padding: 0.5rem;
`

type LocationColorSelectorProps = {
  setColor: (color: string) => void
}

type ColorSwatchProps = {
  colorValue: string
  title?: string
} & LocationColorSelectorProps

const ColorPaletItem = ({ title, colorValue, setColor }: ColorSwatchProps) => {
  return (
    <Tooltip title={title || ''} disableInteractive>
      <ColorSwatch color={colorValue} onClick={() => setColor(colorValue)} />
    </Tooltip>
  )
}

export const locationColors = {
  purple: '#8E79DD',
  yellow: '#EECC66',
  cyan: '#33BBEE',
  red: '#961E00',
  green: '#117733',
  blue: '#0022FF',
  violet: '#AA4499',
  orange: '#EE7733',
  teal: '#44AA99',
  grey: '#BBBBBB',
  black: '#000000',
  white: '#FFFFFF',
}

export const LocationColorSelector = ({
  setColor,
}: LocationColorSelectorProps) => {
  return (
    <ColorGrid
      container
      direction="column"
      justifyContent="center"
      alignItems="flex-start"
    >
      <Grid item>
        <ColorPaletItem
          title={'White'}
          colorValue={locationColors.white}
          setColor={setColor}
        />
        <ColorPaletItem
          title={'Grey'}
          colorValue={locationColors.grey}
          setColor={setColor}
        />
        <ColorPaletItem
          title={'Black'}
          colorValue={locationColors.black}
          setColor={setColor}
        />
        <ColorPaletItem
          title={'Yellow'}
          colorValue={locationColors.yellow}
          setColor={setColor}
        />
      </Grid>
      <Grid item>
        <ColorPaletItem
          title={'Red'}
          colorValue={locationColors.red}
          setColor={setColor}
        />
        <ColorPaletItem
          title={'Green'}
          colorValue={locationColors.green}
          setColor={setColor}
        />
        <ColorPaletItem
          title={'Blue'}
          colorValue={locationColors.blue}
          setColor={setColor}
        />
        <ColorPaletItem
          title={'Orange'}
          colorValue={locationColors.orange}
          setColor={setColor}
        />
      </Grid>
      <Grid item>
        <ColorPaletItem
          title={'Cyan'}
          colorValue={locationColors.cyan}
          setColor={setColor}
        />
        <ColorPaletItem
          title={'Violet'}
          colorValue={locationColors.violet}
          setColor={setColor}
        />
        <ColorPaletItem
          title={'Teal'}
          colorValue={locationColors.teal}
          setColor={setColor}
        />
        <ColorPaletItem
          title={'Purple'}
          colorValue={locationColors.purple}
          setColor={setColor}
        />
      </Grid>
    </ColorGrid>
  )
}
