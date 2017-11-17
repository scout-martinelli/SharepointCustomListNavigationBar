import SharePointDataProvider from "./dataProviders/SharePointDataProvider";
import IListNavigationDataProvider from "./dataProviders/IListNavigationDataProvider";
import IList from "./models/IList";
import { } from "@microsoft/sp-webpart-base/lib/core/IWebPartContext";
import WebPartContext from "@microsoft/sp-webpart-base/lib/core/WebPartContext";
import * as React from "react";
import * as ReactDom from "react-dom";
import * as lodash from "@microsoft/sp-lodash-subset";
import { Version } from "@microsoft/sp-core-library";
import { IWebPartContext } from "@microsoft/sp-webpart-base";
import {
  BaseClientSideWebPart,
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneLabel,
  IPropertyPaneField,
  PropertyPaneDropdown,
  IPropertyPaneDropdownOption
} from "@microsoft/sp-webpart-base";

import * as strings from "ListNavigationWebPartStrings";
import ListNavigation from "./components/list_navigation/ListNavigation";
import { IListNavigationProps } from "./components/list_navigation/IListNavigationProps";
// import { IListNavigationWebPartProps } from "./IListNavigationWebPartProps";

export interface IListNavigationWebPartProps {
  context:IWebPartContext;
  description: string;
  listTitles: string[];
  listGUIDs: string[];
  selectedList: string;
  dataProvider: IListNavigationDataProvider;
  configureStartCallback: () => void;
}

export default class ListNavigationWebPart extends BaseClientSideWebPart<IListNavigationWebPartProps> {
  private _dropdownOptions: IPropertyPaneDropdownOption[];
  private _dataProvider: IListNavigationDataProvider;
  private _selectedList: IList;
  private _disableDropdown: boolean;

  constructor(context:IWebPartContext) {
    super();
  }

  protected onInit():Promise<void> {
    this.context.statusRenderer.displayLoadingIndicator(this.domElement,"List Navigation");
    this._dataProvider = new SharePointDataProvider();
    this._dataProvider.webPartContext = this.context;
    this._openPropertyPane = this._openPropertyPane.bind(this);

    this._loadLists().then(()=> {
        /*
      d   If a list is already selected, then we would have stored the list Id in the associated web part property.
      d   So, check to see if we do have a selected list for the web part. If we do, then we set that as the selected list
         in the property pane dropdown field.
        */
      if (this.properties.selectedList) {
        this._setSelectedList(this.properties.selectedList.toString());
        this.context.statusRenderer.clearLoadingIndicator(this.domElement);
      }
    });

    return super.onInit();
  }

  private _loadLists(): Promise<any> {
    return this._dataProvider.getLists()
      .then((lists: IList[]) => {
        this._disableDropdown = lists.length === 0;
        if (lists.length !== 0) {
          this._dropdownOptions = lists.map((list: IList) => {
            return {
              key: list.Id,
              text: list.Title
            };
          });
        }
      });
  }

  private _setSelectedList(value: string):void {
    const selectedIndex: number = lodash.findIndex(this._dropdownOptions,
      (item: IPropertyPaneDropdownOption) => item.key === value
    );

    const selectedDropDownOption: IPropertyPaneDropdownOption = this._dropdownOptions[selectedIndex];

    if (selectedDropDownOption) {
      this._selectedList = {
        Title: selectedDropDownOption.text,
        Id: selectedDropDownOption.key.toString()
      };

      // this._dataProvider.selectedList = this._selectedList;
    }
  }

  private _openPropertyPane(): void {
    this.context.propertyPane.open();
  }

  /*---------------- Rendering and Properties -------------------------*/
  public render(): void {
    const element: React.ReactElement<IListNavigationProps > = React.createElement(
      ListNavigation,
      {
        context: this.context,
        description: this.properties.description,
        listTitles: this.properties.listTitles,
        listGUIDs: this.properties.listGUIDs,
        selectedList: this.properties.selectedList,
        dataProvider: this._dataProvider,
        configureStartCallback: this._openPropertyPane
      }
    );
    ReactDom.render(element, this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse("1.0");
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          groups: [
            {
              groupName: strings.GeneralSettingsName,
              groupFields: [
                PropertyPaneTextField("description", {
                  label: strings.DescriptionFieldLabel
                })
              ]
            }
          ]
        },
        {
          groups: [
            {
              groupName: strings.LinkOneGroup,
              groupFields: this._getGroupFields("1")
            },
            {
              groupName: strings.LinkTwoGroup,
              groupFields: this._getGroupFields("2")
            },
            {
              groupName: strings.LinkThreeGroup,
              groupFields: this._getGroupFields("3")
            },
            {
              groupName: strings.LinkFourGroup,
              groupFields: this._getGroupFields("4")
            },
            {
              groupName: strings.LinkFiveGroup,
              groupFields: this._getGroupFields("5")
            }
          ]
        }
      ]
    };
  }

  private _getGroupFields(value: string): IPropertyPaneField<any>[] {
    const fields: IPropertyPaneField<any>[] = [];

    fields.push(PropertyPaneTextField("listTitles[" + value + "]", {
      label: strings.ListTitle
    }));
    fields.push(PropertyPaneDropdown("listGUIDs[" + value + "]", {
      label: strings.SelectAList,
      disabled: this._disableDropdown,
      options: this._dropdownOptions
    }));

    // if no lists are populated show error
    if (this._disableDropdown) {
      fields.push(PropertyPaneLabel(null, {
        text: "Could not find lists in your site. Create one or more lists and then try using the web part."
      }));
    }

    return fields;
  }
}
