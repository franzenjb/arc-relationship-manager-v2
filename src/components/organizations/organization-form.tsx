'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MultiSelect } from '@/components/ui/multi-select'
import { Organization } from '@/lib/types'
import { OrganizationService } from '@/lib/organizations'
import { StaffService, MissionArea, LineOfService, PartnerType, StaffMember } from '@/lib/staff'
import { Loader2, AlertCircle } from 'lucide-react'

const organizationSchema = z.object({
  name: z.string().min(1, 'Organization name is required'),
  description: z.string().optional(),
  mission_area: z.enum(['disaster_relief', 'health_safety', 'military_families', 'international', 'blood_services', 'other']).optional(),
  organization_type: z.enum(['government', 'nonprofit', 'business', 'faith_based', 'educational', 'healthcare', 'other']).optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  phone: z.string().optional(),
  notes: z.string().optional(),
  goals: z.string().optional(),
  status: z.enum(['active', 'inactive', 'prospect']).default('active'),
  region_id: z.string().optional(),
  chapter_id: z.string().optional(),
  county_id: z.string().optional(),
  partner_type: z.string().optional(),
  relationship_manager_id: z.string().optional(),
  alternate_relationship_manager_id: z.string().optional(),
  last_contact_date: z.string().optional(),
  mission_areas: z.array(z.string()).default([]),
  lines_of_service: z.array(z.string()).default([]),
})

type OrganizationFormData = z.infer<typeof organizationSchema>

interface OrganizationFormProps {
  organization?: Organization
  onSuccess?: (organization: Organization) => void
  onCancel?: () => void
}

export function OrganizationForm({ organization, onSuccess, onCancel }: OrganizationFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [regions, setRegions] = useState<any[]>([])
  const [chapters, setChapters] = useState<any[]>([])
  const [counties, setCounties] = useState<any[]>([])
  const [duplicates, setDuplicates] = useState<any[]>([])
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false)
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([])
  const [missionAreas, setMissionAreas] = useState<MissionArea[]>([])
  const [linesOfService, setLinesOfService] = useState<LineOfService[]>([])
  const [partnerTypes, setPartnerTypes] = useState<PartnerType[]>([])

  const form = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema) as any,
    defaultValues: {
      name: organization?.name || '',
      description: organization?.description || '',
      mission_area: organization?.mission_area || undefined,
      organization_type: organization?.organization_type || undefined,
      address: organization?.address || '',
      city: organization?.city || '',
      state: organization?.state || '',
      zip: organization?.zip || '',
      website: organization?.website || '',
      phone: organization?.phone || '',
      notes: organization?.notes || '',
      goals: organization?.goals || '',
      status: organization?.status || 'active',
      region_id: organization?.region_id || '',
      chapter_id: organization?.chapter_id || '',
      county_id: organization?.county_id || '',
      partner_type: organization?.partner_type || '',
      relationship_manager_id: organization?.relationship_manager_id || '',
      alternate_relationship_manager_id: organization?.alternate_relationship_manager_id || '',
      last_contact_date: organization?.last_contact_date || '',
      mission_areas: organization?.mission_areas || [],
      lines_of_service: organization?.lines_of_service || [],
    },
  })

  const watchedName = form.watch('name')
  const watchedRegionId = form.watch('region_id')
  const watchedChapterId = form.watch('chapter_id')

  // Load initial data on mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [regionsData, staffData, missionAreasData, losData, partnerTypesData] = await Promise.all([
          OrganizationService.getRegions(),
          StaffService.getActive(),
          StaffService.getMissionAreas(),
          StaffService.getLinesOfService(),
          StaffService.getPartnerTypes()
        ])
        setRegions(regionsData)
        setStaffMembers(staffData)
        setMissionAreas(missionAreasData)
        setLinesOfService(losData)
        setPartnerTypes(partnerTypesData)
      } catch (error) {
        console.error('Error loading initial data:', error)
      }
    }
    loadInitialData()
  }, [])


  // Load chapters when region changes
  useEffect(() => {
    if (watchedRegionId) {
      OrganizationService.getChaptersByRegion(watchedRegionId).then(setChapters)
      form.setValue('chapter_id', '')
      form.setValue('county_id', '')
    } else {
      setChapters([])
      setCounties([])
    }
  }, [watchedRegionId, form])

  // Load counties when chapter changes
  useEffect(() => {
    if (watchedChapterId) {
      OrganizationService.getCountiesByChapter(watchedChapterId).then(setCounties)
      form.setValue('county_id', '')
    } else {
      setCounties([])
    }
  }, [watchedChapterId, form])

  // Check for duplicates when name changes
  useEffect(() => {
    if (watchedName && watchedName.length > 2 && !organization) {
      setIsCheckingDuplicates(true)
      const timeoutId = setTimeout(async () => {
        try {
          const similar = await OrganizationService.searchSimilar(watchedName, watchedRegionId)
          setDuplicates(similar)
        } catch (error) {
          console.error('Error checking duplicates:', error)
        } finally {
          setIsCheckingDuplicates(false)
        }
      }, 500)

      return () => clearTimeout(timeoutId)
    } else {
      setDuplicates([])
      setIsCheckingDuplicates(false)
    }
  }, [watchedName, watchedRegionId, organization])

  const onSubmit = async (data: OrganizationFormData) => {
    setIsLoading(true)
    try {
      const result = organization
        ? await OrganizationService.update(organization.id, data)
        : await OrganizationService.create(data)
      
      onSuccess?.(result)
    } catch (error: any) {
      console.error('Error saving organization:', error)
      form.setError('root', { message: error.message || 'Failed to save organization' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Duplicate Warning */}
      {duplicates.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-amber-800 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              Potential Duplicates Found
            </CardTitle>
            <CardDescription className="text-amber-700">
              These organizations have similar names. Please verify this isn't a duplicate.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {duplicates.map((dup: any) => (
                <div key={dup.id} className="text-sm">
                  <span className="font-medium">{dup.name}</span>
                  <span className="text-gray-500 ml-2">
                    (Similarity: {Math.round(dup.similarity_score * 100)}%)
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{organization ? 'Edit Organization' : 'Add New Organization'}</CardTitle>
          <CardDescription>
            {organization 
              ? 'Update the organization information below.'
              : 'Enter the details for the new organization.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {form.formState.errors.root && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {form.formState.errors.root.message}
              </div>
            )}

            {/* Basic Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Organization Name *
                    {isCheckingDuplicates && <Loader2 className="inline h-4 w-4 ml-2 animate-spin" />}
                  </label>
                  <Input
                    {...form.register('name')}
                    placeholder="Organization name"
                  />
                  {form.formState.errors.name && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.name.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description of the Organization
                  </label>
                  <textarea
                    {...form.register('description')}
                    className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                    rows={3}
                    placeholder="Describe what this organization does and their mission"
                  />
                </div>

                <div>
                  <label htmlFor="partner_type" className="block text-sm font-medium text-gray-700 mb-2">
                    Partner Type
                  </label>
                  <select
                    {...form.register('partner_type')}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  >
                    <option value="">Select partner type</option>
                    {partnerTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    {...form.register('status')}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="prospect">Prospect</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Mission Areas and Lines of Service */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Mission Areas & Services</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recovery/Response/Preparedness Mission Areas
                  </label>
                  <MultiSelect
                    options={missionAreas.map(ma => ({ id: ma.id, name: ma.name }))}
                    selected={form.watch('mission_areas')}
                    onChange={(selected) => form.setValue('mission_areas', selected)}
                    placeholder="Select mission areas..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    LOS Relationship (Lines of Service)
                  </label>
                  <MultiSelect
                    options={linesOfService.map(los => ({ id: los.id, name: los.name }))}
                    selected={form.watch('lines_of_service')}
                    onChange={(selected) => form.setValue('lines_of_service', selected)}
                    placeholder="Select lines of service..."
                  />
                </div>
              </div>
            </div>

            {/* Geographic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Location</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="region_id" className="block text-sm font-medium text-gray-700 mb-2">
                    Region
                  </label>
                  <select
                    {...form.register('region_id')}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  >
                    <option value="">Select region</option>
                    {regions.map((region) => (
                      <option key={region.id} value={region.id}>
                        {region.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="chapter_id" className="block text-sm font-medium text-gray-700 mb-2">
                    Chapter
                  </label>
                  <select
                    {...form.register('chapter_id')}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                    disabled={!watchedRegionId}
                  >
                    <option value="">Select chapter</option>
                    {chapters.map((chapter) => (
                      <option key={chapter.id} value={chapter.id}>
                        {chapter.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="county_id" className="block text-sm font-medium text-gray-700 mb-2">
                    County
                  </label>
                  <select
                    {...form.register('county_id')}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                    disabled={!watchedChapterId}
                  >
                    <option value="">Select county</option>
                    {counties.map((county) => (
                      <option key={county.id} value={county.id}>
                        {county.name}, {county.state_code}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <Input
                    {...form.register('address')}
                    placeholder="Street address"
                  />
                </div>

                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <Input
                    {...form.register('city')}
                    placeholder="City"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                      State
                    </label>
                    <Input
                      {...form.register('state')}
                      placeholder="State"
                      maxLength={2}
                    />
                  </div>

                  <div>
                    <label htmlFor="zip" className="block text-sm font-medium text-gray-700 mb-2">
                      ZIP Code
                    </label>
                    <Input
                      {...form.register('zip')}
                      placeholder="ZIP"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Red Cross Relationship Management */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Red Cross Relationship Management</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="relationship_manager_id" className="block text-sm font-medium text-gray-700 mb-2">
                    RC Relationship Manager
                  </label>
                  <select
                    {...form.register('relationship_manager_id')}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  >
                    <option value="">Select relationship manager</option>
                    {staffMembers.map((staff) => (
                      <option key={staff.id} value={staff.id}>
                        {staff.first_name} {staff.last_name} {staff.title && `- ${staff.title}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="alternate_relationship_manager_id" className="block text-sm font-medium text-gray-700 mb-2">
                    Alternate RC Relationship Manager
                  </label>
                  <select
                    {...form.register('alternate_relationship_manager_id')}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  >
                    <option value="">Select alternate manager</option>
                    {staffMembers.map((staff) => (
                      <option key={staff.id} value={staff.id}>
                        {staff.first_name} {staff.last_name} {staff.title && `- ${staff.title}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="last_contact_date" className="block text-sm font-medium text-gray-700 mb-2">
                    Last Date of Contact
                  </label>
                  <Input
                    type="date"
                    {...form.register('last_contact_date')}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="goals" className="block text-sm font-medium text-gray-700 mb-2">
                  Goals
                </label>
                <textarea
                  {...form.register('goals')}
                  className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                  rows={3}
                  placeholder="Partnership goals and objectives"
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <Input
                    {...form.register('website')}
                    placeholder="https://example.com"
                  />
                  {form.formState.errors.website && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.website.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <Input
                    {...form.register('phone')}
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  {...form.register('notes')}
                  className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                  rows={3}
                  placeholder="Additional notes about this organization"
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {organization ? 'Update Organization' : 'Create Organization'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}