'use client'
import { Button, Fieldset, FileInput, Group, Loader, Stack, Title } from '@mantine/core'
import api from './api'
import FormMessage from './components/FormMessage'
import { useForm } from '@mantine/form'
import { useEffect, useState } from 'react'

interface HomeForm {
  logoFile: File | null
}

export default function Home() {
  const form = useForm<HomeForm>({
    initialValues: {
      logoFile: null,
    },
  })
  const [isSuccess, setIsSuccess] = useState<boolean>(false)
  const [isError, setIsError] = useState<boolean>(false)

  return (
    <Stack gap={'lg'}>
      <Title order={2}>Главная страница.</Title>
      <form
        onSubmit={form.onSubmit((val) => {
          const fileId = `logo`
          setIsError(false)
          setIsSuccess(false)
          if (!val.logoFile) {
            setIsError(true)
            return
          }
          api.sdk.storage
            .deleteFile(api.otherImagesBucket, fileId)
            .then(() => {
              api.sdk.storage.createFile(api.otherImagesBucket, fileId, val.logoFile!).then(() => {
                setIsSuccess(true)
                // const imageView = api.sdk.storage.getFileView(api.sponsorImagesBucket, fileId)
              })
            })
            .catch((err) => {
              setIsError(true)
              console.error(err)
            })
        })}>
        <Fieldset miw={'50%'} pos='relative' legend={`Загрузка логотипа`}>
          <Group>
            <FileInput
              maw={'50%'}
              accept='image/*'
              label='Логотип'
              // description='Загрузка файла'
              placeholder='Нажмите для загрузки'
              {...form.getInputProps(`logoFile`)}
            />
          </Group>
        </Fieldset>
        <Group w={'100%'}>
          <Button h={'100%'} mt={10} p={15} type='submit' variant='default'>
            Сохранить
          </Button>
          {isError && <FormMessage.Error />}
          {isSuccess && <FormMessage.Success />}
        </Group>
      </form>
    </Stack>
  )
}
