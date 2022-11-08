// ** MUI Imports
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';

import type { InputTextFieldProps, InputSelectFieldProps,InputFileFieldProps,InputCkeditorFieldProps } from 'src/types';
import { InputTextField, InputSelectField, InputHiddenField,InputSwitchField,InputFileField,InputDatepickerField } from 'src/form/components/fields';
import dynamic from "next/dynamic";
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useEffect } from 'react';


const Editor = dynamic(() => import("src/form/components/fields/InputCKEditorField"), {
  ssr: false,
  loading: () => <p>Loading CKEditor...</p>,
});

type Props = {
  dynamicFields: Array<InputTextFieldProps | InputSelectFieldProps>;
  name: string;
};

const GenerateDynamicFields: React.VFC<Props> = (props) => {
  const { dynamicFields, name } = props;
	const {
    control,
    setValue,
		formState: { errors },
	} = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: name,
  });

  useEffect(() => {
    if (fields.length == 0) {
      handleAddItem()
    }
  }, [])

  const handleAddItem = (): void => {
    let item = {}
    dynamicFields.forEach(field => {
      const name =  field.name;
      item = {  ...item,[name]: "" }
    })

    append(item);
  }

	return (
    <>
      <Divider sx={{marginY:4}} />
		  <Grid container marginY={4}>
        <Grid item xs={12} textAlign="right">
          <Button variant="contained"
            onClick={handleAddItem}
            startIcon={<AddIcon />}>
            Add
          </Button>
        </Grid>
      </Grid>

      {fields.map((item, index) => {

        return (
          <Grid container spacing={5} key={item.id} marginBottom={4}>
            <Grid item xs={11}>
              <Grid container spacing={5} >
              {
                  dynamicFields.map((input: InputTextFieldProps | InputSelectFieldProps) => {
                    const inputName = input.name.split(".").pop();
                    input.name = `${name}[${index}].${inputName}`;

                    // @ts-expect-error
                    const error = errors?.[name]?.[index]?.[inputName] ? true : false;
                    // @ts-expect-error
                    const errorMessage = errors?.[name]?.[index]?.[inputName]?.message as string || '';
                    switch (input.type) {
                      case 'select':
                        return (
                            <InputSelectField {...(input as InputSelectFieldProps)}   error={error} errorMessage={errorMessage} key={input.name} />
                        );
                        break;
                      case 'hidden':
                        return <InputHiddenField {...(input as InputTextFieldProps)}  error={error} errorMessage={errorMessage} key={input.name} />;
                        break;
                      case 'editor':
                        return <Editor {...(input as InputCkeditorFieldProps)}  error={error} errorMessage={errorMessage} key={input.name} />;
                        break;
                      case 'switch':
                        return <InputSwitchField {...(input as InputTextFieldProps)}  error={error} errorMessage={errorMessage} key={input.name} />;
                        break;
                      case 'file':
                        return <InputFileField {...(input as InputFileFieldProps)}  error={error} errorMessage={errorMessage} key={input.name} />;
                        break;
                      case 'datepicker':
                        return <InputDatepickerField {...(input as InputTextFieldProps)} key={`input_${index}_${input.name}`} error={error} errorMessage={errorMessage}  />;
                        break;
                      default:
                          return (
                            <InputTextField {...(input as InputTextFieldProps)}  error={error} errorMessage={errorMessage} key={input.name}  />
                          );
                        break;
                      }
                  })
                }
              </Grid>
            </Grid>
            <Grid item xs={1} textAlign="right">
              {fields.length > 1 &&
                <IconButton onClick={() => remove(index)}>
                  <DeleteIcon />
                </IconButton>
              }
            </Grid>
          </Grid>
        )
      })}
    </>
	);
};

export default GenerateDynamicFields;
