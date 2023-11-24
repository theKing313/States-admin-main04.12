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
  ActionIcon,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { RegionI, RegionIScrollBlock } from '@/app/api/types'
import { useEffect, useState } from 'react'

import { IconTrashFilled } from '@tabler/icons-react';
import { useMutation, useQuery } from '@tanstack/react-query'
import FormMessage from '../../FormMessage'


interface RegionIWithFile extends RegionI {
  posterFile?: File
  posterPhotos?: File[]
}
interface GalaryScrollForm {
  data: RegionIWithFile[]
}
function RegionsEditor() {
  const { data: regionScrollData, isLoading: isGalaryScrollDataLoading } = useQuery({
    queryKey: ['Regions'],
    queryFn: () => api.getAllRegions(),
  })

  useEffect(() => {
    if (regionScrollData) {
      form.setValues({ data: regionScrollData })
      form.resetDirty()
    }
  }, [regionScrollData])

  const form = useForm<GalaryScrollForm>({
    initialValues: {
      data: [],
    },
  })

  const {
    mutate: deleteData,
    isLoading: isUpdatingDelete,
    isError: updateErrorDelete,
    isSuccess: updateDoneDelete,
  } = useMutation({
    mutationFn: async (id: any | null | undefined) => {
      return await api.deleteRegions(id)
    },
    onSuccess: (newData) => {

      form.setValues({ data: newData })
      form.resetDirty()
      setTimeout(reset, 2000)
    },
    onError: (error) => {
      console.log(error)
    }

  })
  function deletePost(id: string) {
    deleteData(id)
  };

  const {
    mutate: updateData,
    isLoading: isUpdating,
    isError: updateError,
    isSuccess: updateDone,
    reset,
  } = useMutation({
    mutationFn: async (newRegData: RegionIScrollBlock | null | undefined) => {
      if (newRegData) {
        const dataId = newRegData.map((item) => {
          return item.$id
        })
        const filteredVals = newRegData.map((item) => {
          const newData: any = {
            image: item.image,
            name: item.name
          }
          return newData
        })
        return filteredVals.map((item, i) => { return api.updateRegions(filteredVals[i], dataId[i]) })
      }
    },
    onSuccess: () => {
      setTimeout(reset, 2000)
    },
  })
  const [posterUploadingId, setPosterUploadingId] = useState<number>(-1)

  console.log(form.values)
  return (
    <Fieldset pos='relative' legend='Regions элемент'>
      <LoadingOverlay
        visible={isGalaryScrollDataLoading}
        zIndex={1000}
        overlayProps={{ radius: 'sm', blur: 2 }}
      />
      <form
        onSubmit={form.onSubmit(async (val) => {
          let hasErrors = false
          const values = val.data
          // console.log(values)
          const asyncVals: RegionIScrollBlock = await Promise.all(
            values.map(async (val, i) => {
              if (val.posterFile) {
                setPosterUploadingId(i)
                const hash = (val.name + i + Date.now().toString())
                  .split('')
                  .reduce((a, b) => {
                    a = (a << 5) - a + b.charCodeAt(0)
                    return a & a
                  }, 0)
                const fileId = `region-image-${i}-${hash}`
                await api
                  .uploadRegionImage(fileId, val.posterFile)
                  .then((res) => {
                    const imageView = api.sdk.storage.getFileView(api.regionImagesBucket, fileId)
                    val.image = imageView.href
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
          const filteredVals = asyncVals.filter((item) => item.name && item.image)
          // console.log(filteredVals)
          updateData(filteredVals)
        })}>
        <Stack align='flex-start' justify='flex-start' gap='lg'>
          {Array.isArray(form.values.data) &&
            form.values.data.length !== 0 &&
            form.values.data.map((val, i) => (
              <Fieldset miw={'50%'} pos='relative' legend={`Изображение ${i + 1}`}>
                <Group gap={8} mr={0} style={{ justifyContent: 'end' }}>
                  <ActionIcon onClick={() => deletePost(val["$id"])}>
                    <IconTrashFilled style={{ width: '16px', height: '16px', color: 'red', }} />
                  </ActionIcon>
                </Group>
                <TextInput label={'Заголовок'} {...form.getInputProps(`data.${i}.name`)} />
                <Group>
                  <FileInput
                    maw={'100%'}
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
              form.insertListItem('data', { name: '' })
            }}>
            Добавить изображение
          </Button>


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
            {/* {updateDoneDelete && <FormMessage.Success />} */}
            {/*  */}
          </Group>
        </Stack>
      </form>

    </Fieldset >
  )
}
export { RegionsEditor }
