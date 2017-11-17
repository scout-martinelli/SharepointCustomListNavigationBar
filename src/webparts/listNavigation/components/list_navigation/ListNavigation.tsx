import ListItem from "../list_item/ListItem";
import ConfigurationView from "../configuration_view/ConfigurationView";
import * as React from "react";
import * as update from "immutability-helper";
import { Fabric } from "office-ui-fabric-react";
import styles from "./ListNavigation.module.scss";
import { IListNavigationProps } from "./IListNavigationProps";
import { escape } from "@microsoft/sp-lodash-subset";
import IListItem from "../../models/IListItem";
import ListView from "../list_view/ListView";
import { IListNavigationState } from "./IListNavigationState";
import { CSSTransitionGroup } from "react-transition-group";
import * as $ from "jQuery";

export default class ListNavigation extends React.Component<IListNavigationProps, IListNavigationState> {
  private _showPlaceHolder:boolean = true;
  private _listItems:IListItem[] = [];

  constructor(props:IListNavigationProps) {
    super(props);

    this._listItems = [];

    if(props.listTitles) {
      for(let x:number = 0; x<props.listTitles.length; x++) {
        let listTitle:string = props.listTitles[x];
        if (listTitle !== undefined && listTitle !== "") {
          this._showPlaceHolder = false;
        }
      }
    }

    if(this.state === null) {
      this.setState({ listItems: [] });
      this.state.listItems[0].Fields = [];
      this.state.listItems[0].FieldTitles = [];
      this.setState({visible: false});
    }

    this._configureWebPart = this._configureWebPart.bind(this);
  }

  private _configureWebPart(): void {
    this.props.configureStartCallback();
  }

  /* --------------------------- Toggle Change ----------------------*/
  private toggleChange(e: number): void {
    this.props.dataProvider.selectedList = this.props.listGUIDs[e];

    if ($("#tableDisplay").is(":visible")) {
      console.log("Not Hidden");

      $("#tableDisplay").slideUp("slow", () => {
        this.props.dataProvider.getListItems(this.props.listGUIDs[e])
          .then(items => {
            this.setState({ listItems: items });
            this._listItems = items;
          }).then(() => {
            $("#tableDisplay").slideDown("slow");
          });
      });
    } else {
      console.log("Hidden");
      $("#tableDisplay").show();
      this.props.dataProvider.getListItems(this.props.listGUIDs[e])
        .then(items => {
          console.log("here 2");
          this.setState({ listItems: items });
          this._listItems = items;
        }).then(() => {
          console.log("here 3");
          $("#tableDisplay").slideDown("slow");
        });
    }

  }

  private populateTabs():React.ReactElement<IListNavigationProps> {
    var tabs:any = [];
    var indexCounter:number = 0;

    if(this.props.listTitles) {
      for(let listTitle of this.props.listTitles) {
        if(listTitle !== null && listTitle !== "" && listTitle !== undefined) {
          tabs.push(
            <span className={`ms-font-xl ms-fontColor-white ${styles.listElement}`}
                  onClick={() => this.toggleChange(this.props.listTitles.indexOf(listTitle))}>
              <a className={styles.titleLink}>{listTitle}</a>
            </span>
          );
        }
      }
    }

    return(
      tabs
    );
  }

  private configureCheck():boolean {
    var configure:boolean = false;
    var counter:number = 0;

    if(this.props.listTitles) {
      for(let listTitle of this.props.listTitles){
        if(listTitle === "" || listTitle === undefined || listTitle === null) {
          counter++;
        }
      }
      if(counter === this.props.listTitles.length) {
        configure = true;
      }
    } else {
      configure = true;
    }

    return configure;
  }

  /*-------------------------- Render -------------------------------*/
  public render(): React.ReactElement<IListNavigationProps> {
    this._showPlaceHolder = this.configureCheck();

    return (
      <Fabric>
        {
          this._showPlaceHolder &&
          <ConfigurationView
            icon={ "ms-icon--settings" }
            iconText="List Navigation"
            description="Configure your navigation to be able to browse multiple lists on a single web part."
            buttonLabel="Configure"
            onConfigure={ this._configureWebPart }
            />
          }
          { !this._showPlaceHolder &&
            <div className={styles.listNavigation}>
              <div className={styles.container}>
                <div className={`ms-Grid-row ms-bgColor-themeDark ms-fontColor-white ${styles.row}`}>
                  <div className={`ms-Grid-col ms-lg10 ms-xl8 ms-xlPush2 ms-lgPush1 ${styles.listContainer}`}>
                    {this.populateTabs()}
                  </div>
                </div>
              </div>
              { this.state !== null &&
                <div id="tableDisplay" className={styles.hidden}>
                    <ListView listItems={this.state.listItems} />
                </div>
              }
            </div>
          }
      </Fabric>
    );
  }
}
