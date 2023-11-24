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
import { MagazineI, MagazinesScrollBlock } from '@/app/api/types'
import { useEffect, useState } from 'react'
import FormMessage from '../../FormMessage'

interface MagazineIWithFile extends MagazineI {
  posterFile?: File
}

interface MagazinesScrollForm {
  data: MagazineIWithFile[]
}

function MagazinesScrollEditor() {
  const { data: MagazinesScrollData, isLoading: isMagazinesScrollDataLoading } = useQuery({
    queryKey: ['MagazinesScroll'],
    queryFn: () => api.getMagazinesScroll(),
  })

  const {
    mutate: updateData,
    isLoading: isUpdating,
    isError: updateError,
    isSuccess: updateDone,
    reset,
  } = useMutation({
    mutationFn: async (newMagData: MagazinesScrollBlock | null | undefined) => {
      if (newMagData) {
        return api.setBlock('magazinesScroll', newMagData)
      }
    },
    onSuccess: () => {
      setTimeout(reset, 2000)
    },
  })

  const [posterUploadingId, setPosterUploadingId] = useState<number>(-1)

  const form = useForm<MagazinesScrollForm>({
    initialValues: {
      data: [],
    },
  })

  useEffect(() => {
    if (MagazinesScrollData) {
      form.setValues({ data: MagazinesScrollData })
      form.resetDirty()
    }
  }, [MagazinesScrollData])

  return (
    <Fieldset pos='relative' legend='MagazinesScroll элемент'>
      <LoadingOverlay
        visible={isMagazinesScrollDataLoading}
        zIndex={1000}
        overlayProps={{ radius: 'sm', blur: 2 }}
      />

      <form
        onSubmit={form.onSubmit(async (val) => {

          let hasErrors = false
          const values = val.data
          const asyncVals: MagazinesScrollBlock = await Promise.all(
            values.map(async (val, i) => {
              if (val.posterFile) {
                setPosterUploadingId(i)
                const hash = (val.title + val.subtitle + i + Date.now().toString())
                  .split('')
                  .reduce((a, b) => {
                    a = (a << 5) - a + b.charCodeAt(0)
                    return a & a
                  }, 0)
                const fileId = `magazinesScroll-image-${i}-${hash}`
                await api
                  .uploadMagazineImage(fileId, val.posterFile)
                  .then((res) => {
                    const imageView = api.sdk.storage.getFileView(api.magazinesImagesBucket, fileId)
                    val.imageUrl = imageView.href
                  })
                  .catch((err) => {
                    hasErrors = true
                    form.setFieldError(`data.${i}.posterFile`, err.message)
                  })
                  .finally(() => {
                    setPosterUploadingId(-1)
                    delete val.posterFile
                  })
              }
              return val
            })
          )
          if (hasErrors) return
          const filteredVals = asyncVals.filter((item) => item.title && item.subtitle && item.imageUrl)
          updateData(filteredVals)
        })}>
        <Stack align='flex-start' justify='flex-start' gap='lg'>
          {Array.isArray(form.values.data) &&
            form.values.data.length !== 0 &&
            form.values.data.map((val, i) => (
              <Fieldset miw={'50%'} pos='relative' legend={`Изображение ${i + 1}`}>
                <TextInput label={'Заголовок'} {...form.getInputProps(`data.${i}.title`)} />
                <TextInput label={'Подзаголовок'} {...form.getInputProps(`data.${i}.subtitle`)} />
                <Group>
                  <FileInput
                    maw={'50%'}
                    accept='image/*'
                    label='Постер'
                    description='Загрузка файла'
                    placeholder='Нажмите для загрузки'
                    {...form.getInputProps(`data.${i}.posterFile`)}
                  />
                  {posterUploadingId === i && <Loader color='blue' />}
                </Group>
              </Fieldset>
            ))}
          <Divider my='sm' />
          <Button
            onClick={() => {
              form.insertListItem('data', { title: '', subtitle: '' })
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
              loading={posterUploadingId !== -1 || isUpdating}
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

export { MagazinesScrollEditor }
