import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { useCreatePlayer, useUpdatePlayer } from '@/hooks/usePlayers'
import { playersApi, type Player } from '@/api/players'
import { useQuery } from '@tanstack/react-query'
import { FormField } from '@/components/shared/FormField'
import { PageHeader } from '@/components/shared/PageHeader'
import { BowlingStyleLabels } from '@/types/enums'

interface PlayerForm {
  fullName: string
  shortName: string
  nickname: string
  faculty: string
  degree: string
  batchYear: number
  battingStyle: string
  primaryBowlingStyle: string
  isActive: boolean
}

export default function CreateEditPlayerPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = !!id
  const createPlayer = useCreatePlayer()
  const updatePlayer = useUpdatePlayer()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<PlayerForm>({
    defaultValues: {
      fullName: '',
      shortName: '',
      nickname: '',
      faculty: '',
      degree: '',
      batchYear: 25,
      battingStyle: 'RHB',
      primaryBowlingStyle: '',
      isActive: true,
    }
  })

  const { data: existing } = useQuery<Player>({
    queryKey: ['player', id],
    queryFn: () => playersApi.getById(id!),
    enabled: isEdit,
  })

  // Reset form when existing player data loads
  useEffect(() => {
    if (existing) {
      reset({
        fullName: existing.fullName,
        shortName: existing.shortName,
        nickname: existing.nickname ?? '',
        faculty: existing.faculty ?? '',
        degree: existing.degree ?? '',
        batchYear: existing.batchYear,
        battingStyle: existing.battingStyle,
        primaryBowlingStyle: existing.primaryBowlingStyle ?? '',
        isActive: existing.isActive,
      })
    }
  }, [existing, reset])

  const onSubmit = async (data: PlayerForm) => {
    try {
      const payload = {
        fullName: data.fullName,
        shortName: data.shortName,
        nickname: data.nickname || undefined,
        faculty: data.faculty || undefined,
        degree: data.degree || undefined,
        batchYear: Number(data.batchYear),
        battingStyle: data.battingStyle,
        primaryBowlingStyle: data.primaryBowlingStyle || undefined,
        isActive: data.isActive,
      }
      
      if (isEdit) {
        await updatePlayer.mutateAsync({ id: id!, data: payload })
      } else {
        await createPlayer.mutateAsync(payload)
      }
      navigate('/admin/players')
    } catch {
      // Handle error - you might want to use a toast notification here
      console.error('Failed to save player')
    }
  }

  return (
    <div className="max-w-2xl">
      <PageHeader
        title={isEdit ? 'Edit Player' : 'New Player'}
        subtitle={isEdit
          ? 'Update player information'
          : 'Add a new player to the squad'}
      />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-slate-800/60 border border-slate-700 rounded-xl p-6 space-y-5"
      >
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Full Name" required>
            <input
              {...register('fullName', { required: 'Full name is required' })}
              className="input-base w-full"
              placeholder="Gavin Botheju"
            />
            {errors.fullName && <p className="text-red-400 text-sm mt-1">{errors.fullName.message}</p>}
          </FormField>
          
          <FormField label="Short Name" required hint="Displayed on scorecards">
            <input
              {...register('shortName', { required: 'Short name is required' })}
              className="input-base w-full"
              placeholder="Gavin"
            />
            {errors.shortName && <p className="text-red-400 text-sm mt-1">{errors.shortName.message}</p>}
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Nickname" hint='e.g. "Gavi"'>
            <input
              {...register('nickname')}
              className="input-base w-full"
              placeholder="Gavi"
            />
          </FormField>
          
          <FormField label="Batch Year" required hint="e.g. 21 for 2021 intake">
            <input
              type="number"
              {...register('batchYear', { 
                required: 'Batch year is required',
                min: { value: 17, message: 'Batch year must be 17 or higher' },
                max: { value: 30, message: 'Batch year must be 30 or lower' }
              })}
              className="input-base w-full"
            />
            {errors.batchYear && <p className="text-red-400 text-sm mt-1">{errors.batchYear.message}</p>}
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Batting Style" required>
            <select {...register('battingStyle', { required: 'Batting style is required' })} className="input-base w-full">
              <option value="RHB">Right-hand bat</option>
              <option value="LHB">Left-hand bat</option>
            </select>
          </FormField>
          
          <FormField label="Primary Bowling Style">
            <select {...register('primaryBowlingStyle')} className="input-base w-full">
              <option value="">Non-bowler / Unknown</option>
              {Object.entries(BowlingStyleLabels).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Faculty">
            <input {...register('faculty')} className="input-base w-full" placeholder="Faculty of Information Technology" />
          </FormField>
          
          <FormField label="Degree">
            <input {...register('degree')} className="input-base w-full" placeholder="B.Sc. IT" />
          </FormField>
        </div>

        {isEdit && (
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              {...register('isActive')}
              className="w-4 h-4 rounded accent-blue-500"
            />
            <span className="text-sm text-slate-300">Active player</span>
          </label>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white
                       font-medium rounded-lg transition-colors"
          >
            {isEdit ? 'Save Changes' : 'Create Player'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/players')}
            className="px-5 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300
                       rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}