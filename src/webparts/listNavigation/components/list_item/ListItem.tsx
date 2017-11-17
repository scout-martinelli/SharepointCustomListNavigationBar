import * as React from "react";
import {
    Checkbox,
    Button,
    ButtonType,
    FocusZone,
    FocusZoneDirection,
    css
} from "office-ui-fabric-react";
// import styles from "./ListItem.module.scss";
import ITodoItem from "../../models/IListItem";
import IListItemProps from "./IListItemProps";
import * as update from "immutability-helper";

export default class ListItem extends React.Component<IListItemProps, {}> {

    constructor(props: IListItemProps) {
        super(props);
    }

    public shouldComponentUpdate(newProps: IListItemProps): boolean {
        return (
            this.props.item !== newProps.item
        );
    }

    public render(): JSX.Element {
        const classTodoItem: string = css(
            // styles.todoListItem,
            "ms-Grid",
            "ms-u-slideDownIn20"
        );

        return (
            <div
                role="row"
                className={classTodoItem}
                data-is-focusable={true}
            >
                <FocusZone direction={FocusZoneDirection.horizontal}>

                    {/* <div className={css(styles.itemTaskRow, "ms-Grid-row")}>

                    </div> */}
                </FocusZone>
            </div>
        );
    }
}