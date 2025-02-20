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
type IndividualSettingsComponentType = ({ SettingsComponents, }: {
    SettingsComponents: SettingsComponentType;
}) => React.ReactNode;
export type SettingsComponentType = {
    [key: string]: {
        component: IndividualSettingsComponentType;
    };
};
export declare const BaseSettings: SettingsComponentType;
type UserSettingsProps = {
    SettingsComponents: SettingsComponentType;
};
declare const UserSettings: ({ SettingsComponents }: UserSettingsProps) => import("react/jsx-runtime").JSX.Element;
export default UserSettings;
