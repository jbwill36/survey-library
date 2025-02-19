import * as React from "react";
import {
  ReactSurveyElement,
  SurveyQuestionElementBase,
} from "./reactquestion_element";
import { SurveyQuestion, SurveyQuestionAndErrorsCell } from "./reactquestion";
import {
  MatrixDropdownRowModelBase,
  QuestionMatrixDropdownModelBase,
  QuestionMatrixDropdownRenderedRow,
  QuestionMatrixDropdownRenderedCell,
  MatrixDropdownCell
} from "survey-core";
import { Question } from "survey-core";
import { SurveyQuestionCheckboxItem } from "./reactquestion_checkbox";
import { SurveyQuestionRadioItem } from "./reactquestion_radiogroup";
import { SurveyPanel } from "./panel";

import { SurveyActionBar } from "./components/action-bar/action-bar";
import { IActionBarItem } from "survey-core";
import { dragDropTD } from "./drag-drop-td";
import { ReactSurveyModel } from "./reactsurveymodel";

export class SurveyQuestionMatrixDropdownBase extends SurveyQuestionElementBase {
  constructor(props: any) {
    super(props);
    this.state = this.getState();
  }
  protected get question(): QuestionMatrixDropdownModelBase {
    return this.questionBase as QuestionMatrixDropdownModelBase;
  }
  private getState(prevState: any = null) {
    return { rowCounter: !prevState ? 0 : prevState.rowCounter + 1 };
  }
  private updateVisibleRowsChangedCallback() {
    this.question.visibleRowsChangedCallback = () => {
      this.updateStateOnCallback();
    };
  }
  private renderedTableResetCallback() {
    this.question.onRenderedTableResetCallback = () => {
      this.updateStateOnCallback();
    };
  }
  private updateStateOnCallback() {
    if (this.isRendering) return;
    this.setState(this.getState(this.state));
  }
  componentDidMount() {
    super.componentDidMount();
    this.updateVisibleRowsChangedCallback();
    this.renderedTableResetCallback();
  }
  protected renderElement(): JSX.Element {
    return this.renderTableDiv();
  }
  renderTableDiv(): JSX.Element {
    var header = this.renderHeader();
    var footers = this.renderFooter();
    var rows = this.renderRows();
    var divStyle = this.question.horizontalScroll
      ? ({ overflowX: "scroll" } as React.CSSProperties)
      : ({} as React.CSSProperties);
    return (
      <div style={divStyle} ref={root => (this.control = root)}>
        <table className={this.question.cssClasses.root}>
          {header}
          {rows}
          {footers}
        </table>
      </div>
    );
  }
  renderHeader(): JSX.Element {
    var table = this.question.renderedTable;
    if (!table.showHeader) return null;
    var headers: any[] = [];
    var dragDropTH = this.question.allowRowsDragAndDrop ? <td /> : null;
    var cells = table.headerRow.cells;
    for (var i = 0; i < cells.length; i++) {
      var cell = cells[i];
      var key = "column" + i;
      var columnStyle: any = {};
      if (!!cell.width) {
        columnStyle.width = cell.width;
      }
      if (!!cell.minWidth) {
        columnStyle.minWidth = cell.minWidth;
      }
      var columnTitle = this.renderLocString(cell.locTitle);
      var requiredSpace = !!cell.requiredText ? <span>&nbsp;</span> : null;
      var requiredText = !!cell.requiredText ? (
        <span>{cell.requiredText}</span>
      ) : null;

      const readyCell = <>
          {columnTitle}
          {requiredSpace}
          {requiredText}
      </>;

      headers.push(
        <th
          className={this.question.cssClasses.headerCell}
          key={key}
          style={columnStyle}
        >
          {this.wrapCell(cell, readyCell, "column-header")}
        </th>
      );
    }
    return (
      <thead>
        <tr>
          {dragDropTH}
          {headers}
        </tr>
      </thead>
    );
  }
  renderFooter(): JSX.Element {
    var table = this.question.renderedTable;
    if (!table.showFooter) return null;
    var row = this.renderRow(
      "footer",
      table.footerRow,
      this.question.cssClasses
    );
    return <tfoot>{row}</tfoot>;
  }
  renderRows(): JSX.Element {
    var cssClasses = this.question.cssClasses;
    var rows = [];
    var renderedRows = this.question.renderedTable.rows;
    for (var i = 0; i < renderedRows.length; i++) {
      rows.push(
        this.renderRow(renderedRows[i].id, renderedRows[i], cssClasses)
      );
    }
    return <tbody>{rows}</tbody>;
  }
  renderRow(
    keyValue: any,
    row: QuestionMatrixDropdownRenderedRow,
    cssClasses: any
  ): JSX.Element {
    var matrixrow = [];
    var cells = row.cells;

    matrixrow.push(
      this.question.allowRowsDragAndDrop ? dragDropTD(this.question) : null
    );

    for (var i = 0; i < cells.length; i++) {
      matrixrow.push(this.renderCell(cells[i], i, cssClasses));
    }
    var key = "row" + keyValue;
    return (
      <tr className={row.className} key={key}>
        {matrixrow}
      </tr>
    );
  }

  renderCell(
    cell: QuestionMatrixDropdownRenderedCell,
    index: number,
    cssClasses: any
  ): JSX.Element {
    var key = "cell" + index;
    let reason = "";
    if (cell.hasQuestion) {
      return (
        <SurveyQuestionMatrixDropdownCell
          key={key}
          cssClasses={cssClasses}
          cell={cell}
          creator={this.creator}
        />
      );
    }
    var cellContent = null;
    var requiredSpace = null;
    var requiredText = null;
    var cellStyle: any = null;
    if (!!cell.width || !!cell.minWidth) {
      cellStyle = {};
      if (!!cell.width) cellStyle.width = cell.width;
      if (!!cell.minWidth) cellStyle.minWidth = cell.minWidth;
    }
    if (cell.hasTitle) {
      reason = "row-header";
      cellContent = this.renderLocString(cell.locTitle);
      if (cell.requiredText) {
        requiredSpace = <span>&nbsp;</span>;
        requiredText = <span>{cell.requiredText}</span>;
      }
    }
    if (cell.isActionsCell) {
      cellContent = (
        <SurveyQuestionMatrixActionsCell
          items={cell.item.getData()}
        ></SurveyQuestionMatrixActionsCell>
      );
    }
    if (cell.hasPanel) {
      cellContent = (
        <SurveyPanel
          key={cell.panel.id}
          element={cell.panel}
          survey={this.question.survey}
          cssClasses={cssClasses}
          isDisplayMode={this.isDisplayMode}
          creator={this.creator}
        />
      );
    }

    const readyCell = <>
        {cellContent}
        {requiredSpace}
        {requiredText}
    </>

    return (
      <td
        className={cell.className}
        key={key}
        style={cellStyle}
        colSpan={cell.colSpans}
      >
        {this.wrapCell(cell, readyCell, reason)}
      </td>
    );
  }

  protected wrapCell(cell: QuestionMatrixDropdownRenderedCell, element: JSX.Element, reason: string): JSX.Element {
    if(!reason) {
      return element;
    }
    const survey: ReactSurveyModel = this.question.survey as ReactSurveyModel;
    let wrapper: JSX.Element;
    if (survey) {
      wrapper = survey.wrapMatrixCell(element, cell, reason);
    }
    return wrapper ?? element;
  }

}

class SurveyQuestionMatrixActionsCell extends ReactSurveyElement {
  constructor(props: any) {
    super(props);
  }

  get items(): Array<IActionBarItem> {
    return this.props.items;
  }
  protected renderElement(): JSX.Element {
    return <SurveyActionBar items={this.items} handleClick={false}></SurveyActionBar>;
  }
}

export class SurveyQuestionMatrixDropdownCell extends SurveyQuestionAndErrorsCell {
  constructor(props: any) {
    super(props);
  }
  private get cell(): QuestionMatrixDropdownRenderedCell {
    return this.props.cell;
  }
  protected getQuestion(): Question {
    var q = super.getQuestion();
    if (!!q) return q;
    return !!this.cell ? this.cell.question : null;
  }
  protected doAfterRender() {
    var el = this.cellRef.current;
    if (
      el &&
      this.cell &&
      this.question &&
      this.question.survey &&
      el.getAttribute("data-rendered") !== "r"
    ) {
      el.setAttribute("data-rendered", "r");
      var options = {
        cell: this.cell,
        cellQuestion: this.question,
        htmlElement: el,
        row: this.cell.row,
        column: this.cell.cell.column,
      };
      this.question.survey.matrixAfterCellRender(this.question, options);
    }
  }
  protected getShowErrors(): boolean {
    return (
      this.question.isVisible &&
      (!this.cell.isChoice || this.cell.isFirstChoice)
    );
  }
  protected getCellClass(): any {
    return this.cell.className;
  }
  protected getCellStyle(): any {
    var res: any = super.getCellStyle();
    if (!!this.cell.width || !!this.cell.minWidth) {
      if (!res) res = {};
      if (!!this.cell.width) res.width = this.cell.width;
      if (!!this.cell.minWidth) res.minWidth = this.cell.minWidth;
    }

    return res;
  }

  protected getHeaderText(): string {
    return this.cell.headers;
  }
  protected renderQuestion(): JSX.Element {
    if (!this.cell.isChoice)
      return SurveyQuestion.renderQuestionBody(this.creator, this.question);
    if (this.cell.isCheckbox) return this.renderCellCheckboxButton();
    return this.renderCellRadiogroupButton();
  }
  private renderCellCheckboxButton(): JSX.Element {
    var key = this.cell.question.id + "item" + this.cell.choiceIndex;
    return (
      <SurveyQuestionCheckboxItem
        key={key}
        question={this.cell.question}
        cssClasses={this.cell.question.cssClasses}
        isDisplayMode={this.cell.question.isInputReadOnly}
        item={this.cell.item}
        isFirst={this.cell.isFirstChoice}
        index={this.cell.choiceIndex.toString()}
        hideCaption={true}
      />
    );
  }
  private renderCellRadiogroupButton(): JSX.Element {
    var key = this.cell.question.id + "item" + this.cell.choiceIndex;
    return (
      <SurveyQuestionRadioItem
        key={key}
        question={this.cell.question}
        cssClasses={this.cell.question.cssClasses}
        isDisplayMode={this.cell.question.isInputReadOnly}
        item={this.cell.item}
        index={this.cell.choiceIndex.toString()}
        isChecked={this.cell.question.value === this.cell.item.value}
        isDisabled={this.cell.question.isReadOnly || !this.cell.item.isEnabled}
        hideCaption={true}
      />
    );
  }
}
