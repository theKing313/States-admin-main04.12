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
import { GalaryI, GalaryScrollBlock } from '@/app/api/types'
import { useEffect, useState } from 'react'
import FormMessage from '../../FormMessage'
import { IconTrashFilled } from '@tabler/icons-react';
import { useMutation, useQuery } from '@tanstack/react-query'
interface GalaryIWithFile extends GalaryI {
  posterFile?: File
  posterPhotos?: File[]
}
interface GalaryScrollForm {
  data: GalaryIWithFile[]
}
function GalaryScrollEditor() {
  const { data: galaryScrollData, isLoading: isGalaryScrollDataLoading } = useQuery({
    queryKey: ['galaryScroll'],
    queryFn: () => api.getGalaryScroll(),
  })

  const form = useForm<GalaryScrollForm>({
    initialValues: {
      data: [],
    },
  })
  const [posterUploadingId, setPosterUploadingId] = useState<number>(-1)
  const [postersUploadingId, setPostersUploadingId] = useState<number>(-1)
  const [disabledButton, setDisabledButton] = useState(false)
  useEffect(() => {
    if (galaryScrollData) {
      form.setValues({ data: galaryScrollData })
      form.resetDirty()
    }
  }, [galaryScrollData])


  function deletePost(id: string) {
    deleteData(id)
  };
  const {
    mutate: deleteData,
  } = useMutation({
    mutationFn: async (id: any | null | undefined) => {
      return api.deleteGalaryScroll(id)
    },
    onSuccess: (newData) => {
      form.setValues({ data: newData })
    },
    onError: (error) => {
      console.log(error)
    }

  })
  const {
    mutate: updateData,
    reset,
    isLoading: isUpdating,
    isError: updateError,
    isSuccess: updateDone,
  } = useMutation({
    mutationFn: async (newGalData: GalaryScrollBlock | null | undefined) => {

      if (newGalData) {
        const dataId = newGalData.map((item) => {
          return item.$id
        })
        const dataPhotos = newGalData.map((item) => {
          return item.photos
        })
        const filteredVals = newGalData.map((item) => {

          const newData: any = {
            mainPhoto: item.mainPhoto,
            photos: dataPhotos[0],//item.photos
            price: Number(item.price),
            features: item.features,
            description: item.description || '',
            status: item.status,
            location: item.location,
            lat: item.lat,
            lon: item.lon,
          }
          return newData
        })
        filteredVals.map((item, i) => { return api.updateGalaryScroll(filteredVals[i], dataId[i]) })

      }

    },
    onSuccess: () => {
      setDisabledButton(false)
      setTimeout(reset, 2000)
    },
    onError: (error) => {
      console.log(error)
    }
  })
  return (
    <Fieldset pos='relative' legend='GalarysScroll элемент'>
      <LoadingOverlay
        visible={isGalaryScrollDataLoading}
        zIndex={1000}
        overlayProps={{ radius: 'sm', blur: 2 }}
      />
      <form
        onSubmit={form.onSubmit(async (val) => {
          let hasErrors = false
          const values = val.data
          setDisabledButton(true)

          const asyncVals: GalaryScrollBlock = await Promise.all(
            values.map(async (val, i) => {
              if (val.posterFile) {
                setPosterUploadingId(i)
                const hash = (val?.features + val?.description + i + Date.now().toString())
                  .split('')
                  .reduce((a, b) => {
                    a = (a << 5) - a + b.charCodeAt(0)
                    return a & a
                  }, 0)
                const fileId = `magazinesScroll-image-${i}-${hash}`
                await api
                  .uploadGalaryImage(fileId, val.posterFile)
                  .then((res) => {
                    const imageView = api.sdk.storage.getFileView(api.galaryImagesBucket, fileId)
                    val.mainPhoto = imageView.href
                    console.log('1111111111111111111111111111111111111')
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
          const asyncVals2: GalaryScrollBlock = await Promise.all(
            values.map(async (val, i) => {
              if (val.posterPhotos) {
                setPostersUploadingId(i)

                const hash = (val?.features + val?.description + i + Date.now().toString())
                  .split('')
                  .reduce((a, b) => {
                    a = (a << 5) - a + b.charCodeAt(0)
                    return a & a
                  }, 0)
                await Promise.all(
                  val.posterPhotos.map(async (valImageFile: File, i: number) => {
                    const fileId = `galaryScroll-image-${i}-${hash}`

                    await api
                      .uploadGalaryImage(fileId, valImageFile)
                      .then((res) => {
                        const imageView = api.sdk.storage.getFileView(api.galaryImagesBucket, fileId)
                        console.log('2222222222222222222222222222', val)
                        // if (imageView) 
                        val.photos = []
                        val?.photos.push(imageView.href)
                      })
                      .catch((err) => {
                        hasErrors = true
                        form.setFieldError(`data.${i}.posterFile`, err.message)
                      })
                      .finally(() => {
                        setPostersUploadingId(-1)
                        delete val.posterPhotos
                      })
                  })
                )
              }
              return val
            })

          )


          const filteredVals = asyncVals.filter((item) =>
            item.description && item.features &&
            item.mainPhoto && item.location &&
            item.price && item.status && item.photos &&   //
            item.lat && item.lon
          )
          if (hasErrors) return
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
                <Group>
                  <FileInput
                    maw={'100%'}
                    accept='image/*'
                    label='Главное фото'
                    description='Загрузка файла'
                    placeholder='Нажмите для загрузки'
                    {...form.getInputProps(`data.${i}.posterFile`)}
                  />
                  {posterUploadingId === i && <Loader color='blue' />}
                </Group>
                <Group>
                  <FileInput
                    maw={'100%'}
                    label="Доп картинки"
                    placeholder="Нажмите для загрузки"
                    description='Загрузка файлов'
                    {...form.getInputProps(`data.${i}.posterPhotos`)}
                    multiple />
                  {postersUploadingId === i && <Loader color='blue' />}
                </Group>


                <TextInput label={'Цена'} {...form.getInputProps(`data.${i}.price`)} />
                <TextInput label={'Заголовок'} {...form.getInputProps(`data.${i}.features`)} />
                <TextInput label={'Описание'} {...form.getInputProps(`data.${i}.description`)} />
                <TextInput label={'Статус'} {...form.getInputProps(`data.${i}.status`)} />
                <TextInput label={'Локация'} {...form.getInputProps(`data.${i}.location`)} />
                <TextInput label={'Широта'} {...form.getInputProps(`data.${i}.lat`)} />
                <TextInput label={'Долгота'} {...form.getInputProps(`data.${i}.lon`)} />


              </Fieldset>
            ))}
          <Divider my='sm' />
          <Button
            onClick={() => {
              form.insertListItem('data', { features: '', description: '' })
            }}>
            Добавить изображение
          </Button>
          <Button
            h={'100%'}
            mt={10}
            p={15}
            loading={posterUploadingId !== -1 || isUpdating}
            type='submit'
            variant='default'
          // disabled={disabledButton}
          >
            Сохранить

          </Button>
          {updateError && <FormMessage.Error />}

          {updateDone && <FormMessage.Success />}

        </Stack>
      </form>

    </Fieldset >
  )
}
export { GalaryScrollEditor }
