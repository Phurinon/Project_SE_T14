import { useState } from 'react'
import { toast } from 'react-toastify'
import Resize from 'react-image-file-resizer'
import { createShopImages, deleteShopImages } from '../../api/shop'
import { Loader } from 'lucide-react'
import useDusthStore from '../../Global Store/DusthStore'

const UploadFile = ({ form, setForm }) => {
    const token = useDusthStore((state) => state.token)
    const [isLoading, setIsLoading] = useState(false)

    const handleOnChange = async (e) => {
        setIsLoading(true)
        const files = e.target.files
        if (!files) {
            setIsLoading(false)
            return
        }

        try {
            let allFiles = [...form.images]
            
            for (let i = 0; i < files.length; i++) {
                const file = files[i]
                if (!file.type.startsWith('image/')) {
                    toast.error(`File ${file.name} is not an image`)
                    continue
                }

                const imageData = await new Promise((resolve) => {
                    Resize.imageFileResizer(
                        file,
                        720,
                        720,
                        "JPEG",
                        80, // Reduced quality for smaller file size
                        0,
                        (data) => resolve(data),
                        "base64"
                    )
                })

                const response = await createShopImages(imageData, token)
                allFiles.push(response)
                toast.success('Image uploaded successfully!')
            }

            setForm(prev => ({
                ...prev,
                images: allFiles
            }))
        } catch (error) {
            console.error('Upload error:', error)
            toast.error('Error uploading image')
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async (public_id) => {
        try {
            await deleteShopImages(public_id, token)
            setForm(prev => ({
                ...prev,
                images: prev.images.filter(item => item.public_id !== public_id)
            }))
            toast.success('Image deleted successfully')
        } catch (error) {
            console.error('Delete error:', error)
            toast.error('Error deleting image')
        }
    }

    return (
        <div className='my-4'>
            <div className='flex flex-wrap mx-4 gap-4 my-4'>
                {isLoading && <Loader className='w-16 h-16 animate-spin'/>}
                
                {form.images.map((item, index) => (
                    <div className='relative' key={index}>
                        <img
                            className='w-24 h-24 hover:scale-105 object-cover rounded'
                            src={item.url}
                            alt={`Upload ${index + 1}`}
                        />
                        <button
                            onClick={() => handleDelete(item.public_id)}
                            className='absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center hover:bg-red-600'
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>

            <div>
                <input
                    onChange={handleOnChange}
                    type='file'
                    name='images'
                    multiple
                    accept="image/*"
                    className="w-full max-w-xs"
                />
            </div>
        </div>
    )
}

export default UploadFile