import React from 'react';
import { SxProps } from '@mui/system';
import type { TextFieldProps, SelectProps } from '@mui/material';
import type { UseFormGetValues,UseFormSetValue } from 'react-hook-form';
export type CategoryTypes = 'news' | 'article' | 'download';

export type handleOnChange =  (e:React.ChangeEvent<HTMLInputElement>,getValues:UseFormGetValues<any>,setValue:UseFormSetValue<any>, onChange:(value:string) => void) => void

type Field = {
	name: string;
	label: string;
	placeholder?: string;
	endAdornment?: React.ReactNode;
	startAdornment?: React.ReactNode;
	gridSize?: number;
  type: string;
  disabled?: boolean;
  error?: boolean;
  errorMessage?: string;
  handleOnChange?:handleOnChange
} & SxProps;

export type OptionProp = {
	label: string;
	value: string | number;
};

export type InputTextFieldProps = TextFieldProps & Field;

export type InputSelectFieldProps = {
  options: OptionProp[] | Promise<OptionProp[]>;
  async?:boolean;
} & Field;

export type InputFileFieldProps = {
  multiple?: boolean;
  accept: string;
} & TextFieldProps &
	Field;

export type InputCheckboxFieldProps = {} & Field;

export type InputRadioFieldProps = {} & Field;

export type InputDateFieldProps = {} & Field;

export type InputCkeditorFieldProps = {
  name: string;
  label: string;
  error: boolean;
  errorMessage: string;
};

// export type TextareaFieldProps = {};
