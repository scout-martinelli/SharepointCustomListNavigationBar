import IListItem from "../../models/IListItem";

export interface IListNavigationState {
    listItems: IListItem[];
    visible: boolean;
}