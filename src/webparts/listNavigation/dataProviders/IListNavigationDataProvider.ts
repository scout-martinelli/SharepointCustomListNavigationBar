import { IWebPartContext } from "@microsoft/sp-webpart-base";
import IList from "../models/IList";
import IListField from "../models/IListField";
import IListItem from "../models/IListItem";

interface IListNavigationDataProvider {
    selectedList: string;

    webPartContext: IWebPartContext;

    getLists(): Promise<IList[]>;

    getListItems(guid:string): Promise<IListItem[]>;

}

export default IListNavigationDataProvider;