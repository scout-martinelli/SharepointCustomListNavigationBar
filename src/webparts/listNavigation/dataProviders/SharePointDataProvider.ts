import {
    SPHttpClient,
    SPHttpClientBatch,
    SPHttpClientResponse
} from "@microsoft/sp-http";
import { IWebPartContext } from "@microsoft/sp-webpart-base";
import IListNavigationDataProvider from "./IListNavigationDataProvider";
import IList from "../models/IList";
import IListField from "../models/IListField";
import IListItem from "../models/IListItem";

export default class SharePointDataProvider implements IListNavigationDataProvider {

    /*----------------------- Variable Declarations --------------------*/
    private _listsUrl: string;
    private _selectedList:string;
    private _webPartContext: IWebPartContext;

    /*---------------------------- Selected List -----------------------*/
    public set selectedList(value: string) {
        this._selectedList = value;
    }

    public get selectedList(): string {
        return this._selectedList;
    }

    /*------------------------- Web Part Context -----------------------*/
    public set webPartContext(value: IWebPartContext) {
        this._webPartContext = value;
        this._listsUrl = `${this._webPartContext.pageContext.web.absoluteUrl}/_api/web/lists`;
    }

    public get webPartContext(): IWebPartContext {
        return this._webPartContext;
    }

    /*---------------------------- Get Lists ---------------------------*/
    /**
     * Gets all the list data and forms it to the IList model through
     * a promise
     * @returns Promise<IList[]>
     */
    public getLists(): Promise<IList[]> {
        return this._getLists(this.webPartContext.spHttpClient);
    }

    /**
     * This function makes an asynchronous REST call to sharepoint to get all
     * the lists and their meta data
     * @param requester
     * @returns Promise<IList[]>
     */
    public _getLists(requester: SPHttpClient): Promise<IList[]> {
        const queryUrl: string = this._listsUrl;

        return this._webPartContext.spHttpClient.get(queryUrl, SPHttpClient.configurations.v1)
            .then((response: SPHttpClientResponse) => {
                return response.json();
            })
            .then((json: { value: IList[] }) => {
                return json.value;
            });
    }

    /*-------------------------- Get List Items ------------------------*/
    /**
     * Gets all the list items data by using the GUID to identify what list
     * to get data from
     * @param guid
     * @return Promise<IListItem[]>
     */
    public getListItems(guid: string): Promise<IListItem[]> {
        return this._getListItems(this.webPartContext.spHttpClient,guid);
    }

    /**
     * This functions makes an asynchronous REST call to sharepoint to get all
     * of the items of a list by using the GUID. The data is formatted as IListItem[]
     * which dynamically can scale to the amount of fields that there are for a list
     * @param requester
     * @param guid
     * @returns Promise<IListItem[]>
     */
    private _getListItems(requester: SPHttpClient, guid: string): Promise<IListItem[]> {
        var listFields:Promise<IListField[]> = this.getShownListFields(guid);

        return listFields.then((response:IListField[]) => {
            const listItemsUrl: string = `${this._listsUrl}(guid'${guid}')/items`;
            const queryString: string = this._formQueryString(response);
            const queryUrl: string = listItemsUrl + queryString;

            return requester.get(queryUrl, SPHttpClient.configurations.v1)
                .then((innerResponse: SPHttpClientResponse) => {
                    return innerResponse.json();
                })
                .then((json:any) => {
                    var listItems: IListItem[] = this._parseListItems(json.value,response);
                    return listItems;
                });
        });
    }

    /*====================== For internal use only =====================*/
    /*------------------------- Get List Fields ------------------------*/
    /**
     * Gets all the fields of a selected list
     * @param guid
     * @returns Promise<IListField[]>
     */
    private getShownListFields(guid: string): Promise<IListField[]> {
        return this._getShownListFields(this.webPartContext.spHttpClient, guid);
    }

    /**
     * This function makes an asynchronous REST call to sharepoint to get all
     * of the fields for a set list
     * @param requester
     * @param guid
     */
    private _getShownListFields(requester: SPHttpClient, guid: string): Promise<IListField[]> {
        var fieldsUrl:string = `${this._listsUrl}(guid'${guid}')/fields?$filter=Hidden eq false and ReadOnlyField eq false`;
        const queryUrl: string = fieldsUrl;

        return requester.get(queryUrl, SPHttpClient.configurations.v1)
            .then((response: SPHttpClientResponse) => {
                return response.json();
            })
            .then((json: { value: IListField[] }) => {
                return json.value.map((field: IListField) => {
                    return field;
                });
            });
    }

    /*------------------------ Utility Functions -----------------------*/
    /**
     * forms a query based on the IList field properties
     * @param values
     * @returns string
     */
    private _formQueryString(values:IListField[]):string {
        var query: string = "?$select=";

        for (let value of values) {
            if (value.InternalName !== "ContentType" && value.InternalName !== "Attachments") {
                query += value.InternalName + ",";
            }
        }
        query = query.substr(0, query.length - 1);

       return query;
    }

    /**
     * adds values to the IListItem and creates a array of IListItem objects
     * @param items
     * @param fields
     */
    private _parseListItems(items:any,fields: IListField[]):IListItem[] {
        var listItems: IListItem[] = [];

        for (let val of items) {
            var item: IListItem;
            item = { Fields: [], FieldTitles: [] };

            for (let field of fields) {
                if (field.InternalName !== "ContentType" && field.InternalName !== "Attachments") {
                    item.FieldTitles.push(field.InternalName);
                    item.Fields.push(val[field.InternalName]);
                }
            }

            listItems.push(item);
        }

        return listItems;
    }
}