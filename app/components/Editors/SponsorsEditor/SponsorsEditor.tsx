'use client'
import api from '@/app/api'
import {
  Fieldset,
  Stack,
  Button,
  TextInput,
  Group,
  LoadingOverlay,
  FileInput,
  Loader,
  Divider,
} from '@mantine/core'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useForm } from '@mantine/form'
import { SponsorsBlock } from '@/app/api/types'
import { useEffect, useState } from 'react'
import FormMessage from '../../FormMessage'

interface SponsorsBlockWithFiles extends SponsorsBlock {
  imageFiles?: File[]
}

interface SponsorsBlockForm {
  data: SponsorsBlockWithFiles
}

function SponsorsEditor() {
  const { data: sponsorsData, isLoading: isSponsorsDataLoading } = useQuery({
    queryKey: ['Sponsors'],
    queryFn: () => api.getSponsors(),
  })

  const {
    mutate: updateData,
    isLoading: isUpdating,
    isError: updateError,
    isSuccess: updateDone,
    reset,
  } = useMutation({
    mutationFn: async (newSpData: SponsorsBlock['imageUrls'] | null | undefined) => {
      if (newSpData) {
        return api.setBlock('sponsors', { imageUrls: newSpData })
      }
    },
    onSuccess: () => {
      setTimeout(reset, 2000)
    },
  })

  const [posterUploading, setPosterUploading] = useState<boolean>(false)

  const form = useForm<SponsorsBlockForm>({
    initialValues: {
      data: { imageUrls: [], imageFiles: [] },
    },
  })

  useEffect(() => {
    if (sponsorsData) {
      form.setValues({ data: { ...sponsorsData, imageFiles: [] } })
      form.resetDirty()
    }
  }, [sponsorsData])

  return (
    <Fieldset pos='relative' legend='Sponsors элемент'>
      <LoadingOverlay
        visible={isSponsorsDataLoading}
        zIndex={1000}
        overlayProps={{ radius: 'sm', blur: 2 }}
      />

      <form
        onSubmit={form.onSubmit(async (val) => {
          let hasErrors = false
          const imageFiles = val.data?.imageFiles || []
          const imageUrls = val.data.imageUrls
          setPosterUploading(true)
          await Promise.all(
            imageFiles.map(async (val, i) => {
              const hash = (val.name + val.size + Date.now().toString()).split('').reduce((a, b) => {
                a = (a << 5) - a + b.charCodeAt(0)
                return a & a
              }, 0)
              const fileId = `sponsor-image-${i}-${hash}`
              await api
                .uploadSponsorImage(fileId, val)
                .then(() => {
                  const imageView = api.sdk.storage.getFileView(api.sponsorImagesBucket, fileId)
                  imageUrls.push(imageView.href)
                })
                .catch((err) => {
                  hasErrors = true
                  form.setFieldError(`data.imageFiles.${i}`, err.message)
                })
              return val
            })
          )
          setPosterUploading(false)
          if (hasErrors) return
          const filteredUrls = imageUrls.filter(Boolean)
          updateData(filteredUrls)
        })}>
        <Stack align='flex-start' justify='flex-start' gap='lg'>
          {Array.isArray(form.values.data.imageUrls) &&
            form.values.data.imageUrls.length !== 0 &&
            form.values.data.imageUrls.map((val, i) => (
              <Fieldset miw={'50%'} pos='relative' legend={`Изображение ${i + 1}`}>
                {/* <TextInput label={'Заголовок'} {...form.getInputProps(`data.${i}.title`)} />
                <TextInput label={'Подзаголовок'} {...form.getInputProps(`data.${i}.subtitle`)} /> */}
                <Group>
                  <FileInput
                    maw={'50%'}
                    accept='image/*'
                    label='Постер'
                    description='Загрузка файла'
                    placeholder='Нажмите для загрузки'
                    {...form.getInputProps(`data.imageFiles.${i}`)}
                  />
                  {posterUploading && <Loader color='blue' />}
                </Group>
              </Fieldset>
            ))}
          <Divider my='sm' />
          <Button
            onClick={() => {
              form.insertListItem('data.imageUrls', '')
            }}>
            Добавить изображение
          </Button>
          {/* <Button
            onClick={() => {
              api.clearAllMagazineImages()
            }}>
            Удалить все изображения из хранилища
          </Button> */}

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

export { SponsorsEditor }
