import React from "react";
import {
  AdaptiveActionBarItemWrapper,
  ActionBar,
  IActionBarItem,
  Base,
  ResponsivityManager,
} from "survey-core";
import { ReactElementFactory } from "../../element-factory";
import { SurveyElementBase } from "../../reactquestion_element";
import { SurveyAction } from "./action-bar-item";

export * from "./action-bar-item";
export * from "./action-bar-item-dropdown";
export * from "./action-bar-separator";

interface IActionBarProps {
  items: Array<IActionBarItem>;
  handleClick?: boolean;
}

export class SurveyActionBar extends SurveyElementBase<IActionBarProps, any> {
  private model = new ActionBar();
  private manager: ResponsivityManager;
  private rootRef: React.RefObject<HTMLDivElement>;

  constructor(props: IActionBarProps) {
    super(props);
    this.rootRef = React.createRef();
  }

  private get handleClick() {
    return this.props.handleClick !== undefined ? this.props.handleClick : true;
  }

  componentDidMount() {
    super.componentDidMount();
    if (!this.hasItems) return;
    const container: HTMLDivElement = this.rootRef.current;
    this.manager = new ResponsivityManager(
      container,
      this.model,
      "span.sv-action"
    );
  }
  componentWillUnmount() {
    this.manager && this.manager.dispose();
    super.componentWillUnmount();
  }

  protected getStateElement(): Base {
    return this.model;
  }
  renderElement(): any {
    this.model.setItems(this.props.items);
    if (!this.hasItems) return null;
    const items = this.renderItems();
    return (
      <div
        ref={this.rootRef}
        className="sv-action-bar"
        onClick={this.handleClick ? function(event) {
          event.stopPropagation();
        } : undefined}
      >
        {items}
      </div>
    );
  }

  get hasItems(): boolean {
    return (this.model.items || []).length > 0;
  }

  renderItems() {
    return this.model.items.map(
      (item: AdaptiveActionBarItemWrapper, itemIndex: number) => {
        if (!item.visible && item.visible !== undefined) {
          return null;
        }
        return (
          <SurveyAction item={item} key={"item" + itemIndex}></SurveyAction>
        );
      }
    );
  }
}

ReactElementFactory.Instance.registerElement("sv-action-bar", (props) => {
  return React.createElement(
    SurveyActionBar,
    (props as any) as IActionBarProps
  );
});
