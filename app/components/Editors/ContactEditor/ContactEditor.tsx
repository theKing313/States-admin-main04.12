'use client'
import api from '@/app/api'
import { Fieldset, Stack, Button, TextInput, Group, LoadingOverlay, FileInput, Loader } from '@mantine/core'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useForm } from '@mantine/form'
import { ContactBlock, HeroBlock } from '@/app/api/types'
import { useEffect } from 'react'
import FormMessage from '../../FormMessage'
import { useDisclosure } from '@mantine/hooks'

interface ContactBlockWithFiles extends ContactBlock {
  bgPosterFile?: File
}

function ContactEditor() {
  const { data: contactData, isLoading: isContactDataLoading } = useQuery({
    queryKey: ['contact'],
    queryFn: () => api.getContact(),
  })

  const {
    mutate: updateData,
    isLoading: isUpdating,
    isError: updateError,
    isSuccess: updateDone,
    reset,
  } = useMutation({
    mutationFn: async (newContacts: ContactBlockWithFiles | null | undefined) => {
      if (newContacts) {
        delete newContacts.bgPosterFile
        return api.setBlock('contact', newContacts as ContactBlock)
      }
    },
    onSuccess: () => {
      setTimeout(reset, 2000)
    },
  })

  const [posterUploading, posterUploadingControl] = useDisclosure(false)

  const form = useForm<ContactBlockWithFiles>({})

  useEffect(() => {
    if (contactData) {
      form.setValues(contactData)
      form.resetDirty(contactData)
    }
  }, [contactData])

  return (
    <Fieldset pos='relative' legend='Contact элемент'>
      <LoadingOverlay visible={isContactDataLoading} zIndex={1000} overlayProps={{ radius: 'sm', blur: 2 }} />

      <form
        onSubmit={form.onSubmit(async (values) => {
          console.log(values)
          let hasErrors = false
          if (values.bgPosterFile) {
            posterUploadingControl.open()
            await api
              .uploadFile('contact-bgPoster', values.bgPosterFile)
              .then((res) => {
                const bgPosterUrl = api.sdk.storage.getFileView(api.blockContentBucket, 'contact-bgPoster')
                values.backgroundUrl = bgPosterUrl.href
              })
              .catch((err) => {
                hasErrors = true
                form.setFieldError(
                  'bgPosterFile',
                  err.message // === 'File extension not allowed' ? 'Недопустимый формат файла' : err.message,
                )
              })
              .finally(() => {
                posterUploadingControl.close()
              })
          }
          if (hasErrors) return
          updateData(values)
        })}>
        <Stack align='flex-start' justify='flex-start' gap='lg'>
          <TextInput required miw={'30%'} label={'Верхняя строка'} {...form.getInputProps('titleText')} />
          <TextInput required miw={'30%'} label={'Текст в кнопке'} {...form.getInputProps('buttonText')} />
          <Group miw={'30%'}>
            <FileInput
              accept='image/*'
              label='Фоновый постер'
              // description='Загрузка файла.'
              placeholder='Нажмите для загрузки'
              {...form.getInputProps('bgPosterFile')}
            />
            {posterUploading && <Loader color='blue' />}
          </Group>

          <Group w={'100%'}>
            <Button
              h={'100%'}
              mt={10}
              p={15}
              loading={posterUploading || isUpdating}
              type='submit'
              variant='default'>
              Сохранить
            </Button>
            {updateError && <FormMessage.Error />}
            {updateDone && <FormMessage.Success />}
          </Group>
        </Stack>
      </form>
    </Fieldset>
  )
}

export { ContactEditor }
