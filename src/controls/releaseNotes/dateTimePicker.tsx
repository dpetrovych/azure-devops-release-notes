import { DatePicker, DayOfWeek, Dropdown, IDatePickerStrings, IDropdownOption } from '@fluentui/react';
import * as React from 'react';

const DayPickerStrings: IDatePickerStrings = {
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    shortDays: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
    goToToday: 'Go to today',
    prevMonthAriaLabel: 'Go to previous month',
    nextMonthAriaLabel: 'Go to next month',
    prevYearAriaLabel: 'Go to previous year',
    nextYearAriaLabel: 'Go to next year',
    closeButtonAriaLabel: 'Close date picker'
};

const limitTimeOption = (hour: number): number => hour >= 7 && hour <= 21 ? hour : 7;
const timeOptions: IDropdownOption[] = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21]
    .map(t => ({
        text: (t < 10 ? "0" + t : t) + ":00",
        key: t
    }));

export interface IDatePickerProps {
    value?: Date;
}

export interface IDatePickerState {
    value?: Date;
}

export class DateTimePicker extends React.Component<IDatePickerProps, IDatePickerState> {
    constructor(props: IDatePickerProps) {
        super(props);
        this.state = {
            value: props.value
        };
    }

    public render(): JSX.Element {
        const { value } = this.state;
        return (
            <div>
                <DatePicker
                    firstDayOfWeek={DayOfWeek.Monday}
                    strings={DayPickerStrings}
                    showWeekNumbers={true}
                    firstWeekOfYear={1}
                    showMonthPickerAsOverlay={true}
                    value={value}
                    onSelectDate={this._onSelectDate}
                    label="Select release date"
                    placeholder="Select a date..."
                    ariaLabel="Select a date"
                    isRequired={true}
                />
                <Dropdown
                    label="Select time"
                    placeholder="Select time..."
                    options={timeOptions}
                    required={true}
                    selectedKey={value ? limitTimeOption(value.getHours()) : undefined}
                    disabled={value === undefined}
                    onChange={this._onSelectTime}
                />
            </div>
        );
    }

    public getValue = (): Date | undefined => this.state.value;

    public reset = (): void => this.setState({ value: undefined });

    private _onSelectDate = (date: Date | null | undefined): void => {
        this.setState({ value: date ? date : undefined });
    }

    private _onSelectTime = (_event: React.FormEvent<HTMLDivElement>, o: IDropdownOption): void => {
        const value = this.state.value;
        if (value) {
            let newValue = new Date(value);
            newValue.setHours(o.key as number);

            this.setState({ value: newValue });
        }
    }
}
