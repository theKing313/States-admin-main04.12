'use client'
import api from '@/app/api'
import { Fieldset, Stack, Button, TextInput, Group, LoadingOverlay, FileInput, Loader } from '@mantine/core'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useForm } from '@mantine/form'
import { HeroBlock, TwoSidesBlock } from '@/app/api/types'
import { useEffect } from 'react'
import FormMessage from '../../FormMessage'
import { useDisclosure } from '@mantine/hooks'

interface TwoSidesBlockWithFiles extends TwoSidesBlock {
  posterFile?: File
}

function TwoSidesEditor() {
  const { data: twoSidesData, isLoading: isTwoSidesDataLoading } = useQuery({
    queryKey: ['twoSides'],
    queryFn: () => api.getTwoSides(),
  })

  const {
    mutate: updateData,
    isLoading: isUpdating,
    isError: updateError,
    isSuccess: updateDone,
    reset,
  } = useMutation({
    mutationFn: async (newTwoSides: TwoSidesBlockWithFiles | null | undefined) => {
      if (newTwoSides) {
        delete newTwoSides.posterFile
        return api.setBlock('twoSides', newTwoSides as TwoSidesBlock)
      }
    },
    onSuccess: () => {
      setTimeout(reset, 2000)
    },
  })

  const [posterUploading, posterUploadingControl] = useDisclosure(false)

  const form = useForm<TwoSidesBlockWithFiles>({})

  useEffect(() => {
    if (twoSidesData) {
      form.setValues(twoSidesData)
      form.resetDirty(twoSidesData)
    }
  }, [twoSidesData])

  return (
    <Fieldset pos='relative' legend='TwoSides элемент'>
      <LoadingOverlay
        visible={isTwoSidesDataLoading}
        zIndex={1000}
        overlayProps={{ radius: 'sm', blur: 2 }}
      />

      <form
        onSubmit={form.onSubmit(async (values) => {
          console.log(values)
          let hasErrors = false
          if (values.posterFile) {
            posterUploadingControl.open()
            await api
              .uploadFile('twoSides-poster', values.posterFile)
              .then((res) => {
                const posterUrl = api.sdk.storage.getFileView(api.blockContentBucket, 'twoSides-poster')
                values.posterUrl = posterUrl.href
              })
              .catch((err) => {
                hasErrors = true
                form.setFieldError(
                  'posterFile',
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
          <TextInput required miw={'30%'} label={'Заголовок'} {...form.getInputProps('headerText')} />
          <TextInput
            required
            miw={'30%'}
            label={'Основной текст'}
            // description='Текст посередине'
            {...form.getInputProps('mainText')}
          />
          <TextInput required miw={'30%'} label={'Текст кнопки'} {...form.getInputProps('buttonContent')} />
          <TextInput
            required
            w={'30%'}
            label={'Подпись к постеру'}
            description={'Отображается на случай, если постер не загрузился. Или для людей со скринридерами'}
            {...form.getInputProps('posterAlt')}
          />
          <Group miw={'30%'}>
            <FileInput
              accept='image/*'
              label='Постер'
              description='Загрузка файла. Постер отображается слева от текста'
              placeholder='Нажмите для загрузки'
              {...form.getInputProps('posterFile')}
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

export { TwoSidesEditor }
