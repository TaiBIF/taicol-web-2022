// ** React Imports
import { SyntheticEvent, useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import TabContext from '@mui/lab/TabContext'
import { styled } from '@mui/material/styles'
import MuiTab, { TabProps } from '@mui/material/Tab'
import CardHeader from '@mui/material/CardHeader';

// ** Third Party Styles Imports
import 'react-datepicker/dist/react-datepicker.css'

// ** Next Imports
import { useRouter } from 'next/router';

// ** Zod Imports
import { z } from 'zod';

// ** Article Form Imports
import ApidocInfoForm from 'src/form/apidoc/ApidocInfoForm';
import ApidocParamsForm from 'src/form/apidoc/ApidocParamsForm';
import ApidocReturnParamsForm from 'src/form/apidoc/ApidocReturnParamsForm';
import { saveApidocInfoFormSchema,saveApidocParamsFormSchema,saveApidocReturnParamsFormSchema } from 'src/form/apidoc/saveApidocFormSchema';

type SaveInfoFormValues = z.infer<typeof saveApidocInfoFormSchema>;
type SaveParamsFormValues = z.infer<typeof saveApidocParamsFormSchema>;
type SaveReturnParamsFormValues = z.infer<typeof saveApidocReturnParamsFormSchema>;

// **  SWR Imports
import useSWR from 'swr';
const Tab = styled(MuiTab)<TabProps>(({ theme }) => ({
  [theme.breakpoints.down('md')]: {
    minWidth: 100
  },
  [theme.breakpoints.down('sm')]: {
    minWidth: 67
  }
}))

const TabName = styled('span')(({ theme }) => ({
  lineHeight: 1.71,
  fontSize: '0.875rem',
  marginLeft: theme.spacing(2.4),
  [theme.breakpoints.down('md')]: {
    display: 'none'
  }
}))

type ParamsProps = {
  params: SaveParamsFormValues[],
  combine_url: string
}
type ReturnParamsProps = {returnParams:SaveReturnParamsFormValues[]}
type ResponseProps = {
  info: SaveInfoFormValues,
  params:ParamsProps
  returnParams: ReturnParamsProps
}

const ApiDocPage = () => {
  // ** State
	const router = useRouter();
	const { id } = router.query;
  const [value, setValue] = useState<string>('information')
  const { data: apiDoc, isValidating: isInfoValidating } = useSWR<ResponseProps>(`/api/admin/apidoc/info`, {
  revalidateOnFocus: false,
  revalidateOnMount:false,
  revalidateOnReconnect: false,
  refreshWhenOffline: false,
  refreshWhenHidden: false,
  refreshInterval: 0
});

  const handleChange = (event: SyntheticEvent, newValue: string) => {
    setValue(newValue)
  }

  console.log('apiDoc.params',apiDoc?.params)
  return (
    <Card>
			<CardHeader title="API Doc" />
      <TabContext value={value}>
        <TabList
          onChange={handleChange}
          aria-label='apidoc tabs'
          sx={{ borderBottom: theme => `1px solid ${theme.palette.divider}` }}
        >
          <Tab
            value='information'
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TabName>基本設定</TabName>
              </Box>
            }
          />
          <Tab
            value='params'
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TabName>API參數說明</TabName>
              </Box>
            }
          />
          <Tab
            value='returnParams'
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TabName>回傳欄位說明</TabName>
              </Box>
            }
          />
        </TabList>

        <TabPanel sx={{ p: 0 }} value='information'>
          {!isInfoValidating && <ApidocInfoForm defaultValues={apiDoc?.info as SaveInfoFormValues } />}
        </TabPanel>
        <TabPanel sx={{ p: 0 }} value='params'>
          {!isInfoValidating && <ApidocParamsForm
            defaultValues={apiDoc?.params as ParamsProps}  />}
        </TabPanel>
        <TabPanel sx={{ p: 0 }} value='returnParams'>
          {!isInfoValidating && <ApidocReturnParamsForm defaultValues={apiDoc?.returnParams as ReturnParamsProps }  />}
        </TabPanel>
      </TabContext>
    </Card>
  )
}

export default ApiDocPage
