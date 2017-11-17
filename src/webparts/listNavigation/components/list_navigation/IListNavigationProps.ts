import IWebPartContext from "@microsoft/sp-webpart-base/lib/core/IWebPartContext";
import IListNavigationDataProvider from "../../dataProviders/IListNavigationDataProvider";

export interface IListNavigationProps {
  context:IWebPartContext;
  dataProvider: IListNavigationDataProvider;
  description: string;
  listTitles: string[];
  listGUIDs: string[];
  selectedList: string;

  configureStartCallback: () => void;
}
