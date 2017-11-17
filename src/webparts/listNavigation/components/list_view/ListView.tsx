import * as React from "react";
import * as lodash from "@microsoft/sp-lodash-subset";
import * as strings from "ListNavigationWebPartStrings";
import { List, FocusZone, FocusZoneDirection, getRTLSafeKeyCode, KeyCodes } from "office-ui-fabric-react";
import styles from "./ListView.module.scss";
import IListViewProps from "./IListViewProps";
import IListItem from "../../models/IListItem";
import ListItem from "../list_item/ListItem";

export default class IFrame extends React.Component<IListViewProps, {}> {
    constructor(props: IListViewProps) {
        super(props);

        this.generateTableContents = this.generateTableContents.bind(this);
        this.generateHeader= this.generateHeader.bind(this);
    }

    public render(): React.ReactElement<IListViewProps> {
        if(this.props.listItems.length !== 0) {
            return (
                <FocusZone>
                    <div className={`ms-Grid ${styles.listFrameContainer}`}>
                        {this.generateHeader(this.props.listItems)}
                        {this.generateTableContents(this.props.listItems)}
                    </div>
                </FocusZone>
            );
        } else {
            return (
                <FocusZone>
                    <div className={`ms-Grid ${styles.listFrameContainer}`}>
                        <div className={`ms-Grid-row ms-bgColor-themePrimary ${styles.listViewRow}`}>
                            <div className={`ms-Grid-col ms-font-xl ms-fontWeight-semibold ${styles.listViewColumn}`}>
                                {strings.NoDataError}
                            </div>
                        </div>
                    </div>
                </FocusZone>
            );
        }
    }

    private generateTableContents(items: IListItem[]): React.ReactElement<IListViewProps> {
        var rows:any = [];
        var columns:any = [];
        var stripedCounter:number = 1;

        for(let item of items){
            for(let field of item.Fields){
                columns.push(
                    <div className={`ms-Grid-col ms-font-xl ${styles.listViewColumn}`}>
                        {field}
                    </div>
                );
            }
            if(stripedCounter % 2 === 0) {
                rows.push(
                    <div className={`ms-Grid-row ms-bgColor-themeLight ${styles.listViewRow}`}>
                        {columns}
                    </div>
                );
            } else {
                rows.push(
                    <div className={`ms-Grid-row ms-bgColor-themeLighter ${styles.listViewRow}`}>
                        {columns}
                    </div>
                );
            }
            stripedCounter++;
            columns = [];
        }

        console.log(rows);

        return rows;
    }

    private generateHeader(items: IListItem[]): React.ReactElement<IListViewProps> {
        var row:any = [];
        var column: any = [];

        if(items[1]) {
            for(let title of items[1].FieldTitles){
                column.push(
                    <div className={`ms-Grid-col ms-font-xl ms-fontWeight-semibold ms-fontColor-white ${styles.listViewColumn}`}>
                        {title}
                    </div>
                );
            }

            row.push(
                <div className={`ms-Grid-row ms-bgColor-themePrimary ${styles.listViewRow}`}>
                    {column}
                </div>
            );
        }

        return row;
    }
}