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

export interface FontAwesomeIconConfig {
  // FontAwesome classes, e.g., 'fa fa-file-text'
  class: string
}

export interface ValueInformation {
  attributes: {
    [key: string]: string[] // the values to use when filtering on this attribute
  }
  // Optional in case some data types might not have an associated icon, eg
  iconConfig?: FontAwesomeIconConfig
}

export interface DataTypesConfiguration {
  groups: {
    [key: string]: {
      values: {
        [key: string]: ValueInformation
      }
      iconConfig?: FontAwesomeIconConfig
    }
  }
}

// this is a structure to make it easier to go from value to group, which we'll make by transforming the DataTypesConfiguration
export interface ReverseDataTypesConfiguration {
  [key: string]: {
    group: {
      name: string
      iconConfig?: FontAwesomeIconConfig
    }
  } & ValueInformation
}
