import { useState, useEffect } from 'react';
import { Save, Building2, Phone, Globe, MapPin } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { getSchoolInfo, saveSchoolInfo } from '@/store';

export function SchoolSettings() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    schoolName: '',
    schoolCode: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phonePrimary: '',
    phoneSecondary: '',
    email: '',
    website: '',
    principalName: '',
    affiliationBoard: '',
    affiliationNumber: '',
    establishedYear: '',
    motto: '',
  });

  useEffect(() => {
    const info = getSchoolInfo();
    if (info) {
      setFormData({
        schoolName: info.schoolName || '',
        schoolCode: info.schoolCode || '',
        address: info.address || '',
        city: info.city || '',
        state: info.state || '',
        pincode: info.pincode || '',
        phonePrimary: info.phonePrimary || '',
        phoneSecondary: info.phoneSecondary || '',
        email: info.email || '',
        website: info.website || '',
        principalName: info.principalName || '',
        affiliationBoard: info.affiliationBoard || '',
        affiliationNumber: info.affiliationNumber || '',
        establishedYear: info.establishedYear || '',
        motto: info.motto || '',
      });
    }
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    saveSchoolInfo(formData);
    showToast('success', 'School information saved successfully!');
    setLoading(false);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header Card */}
      <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{formData.schoolName || 'Your School'}</h2>
              <p className="text-blue-100 mt-1">{formData.city ? `${formData.city}, ${formData.state}` : 'Update your school information below'}</p>
            </div>
          </div>
          <div className="text-right hidden md:block">
            <p className="text-blue-100 text-sm">Developed by</p>
            <p className="text-xl font-bold">MWA</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
          </div>
          
          <div className="space-y-4">
            <Input
              label="School Name *"
              value={formData.schoolName}
              onChange={(e) => handleChange('schoolName', e.target.value)}
              placeholder="Enter school name"
            />
            <Input
              label="School Code"
              value={formData.schoolCode}
              onChange={(e) => handleChange('schoolCode', e.target.value)}
              placeholder="e.g., SCH001"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Established Year"
                value={formData.establishedYear}
                onChange={(e) => handleChange('establishedYear', e.target.value)}
                placeholder="e.g., 1990"
              />
              <Input
                label="Principal Name"
                value={formData.principalName}
                onChange={(e) => handleChange('principalName', e.target.value)}
                placeholder="Enter name"
              />
            </div>
            <Textarea
              label="Motto"
              value={formData.motto}
              onChange={(e) => handleChange('motto', e.target.value)}
              placeholder="School motto or slogan"
              rows={2}
            />
          </div>
        </Card>

        {/* Contact Information */}
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Phone className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Primary Phone"
                value={formData.phonePrimary}
                onChange={(e) => handleChange('phonePrimary', e.target.value)}
                placeholder="+91 9876543210"
              />
              <Input
                label="Secondary Phone"
                value={formData.phoneSecondary}
                onChange={(e) => handleChange('phoneSecondary', e.target.value)}
                placeholder="+91 9876543211"
              />
            </div>
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="school@example.com"
            />
            <Input
              label="Website"
              value={formData.website}
              onChange={(e) => handleChange('website', e.target.value)}
              placeholder="www.school.com"
            />
          </div>
        </Card>

        {/* Address Information */}
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 rounded-lg">
              <MapPin className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Address</h3>
          </div>
          
          <div className="space-y-4">
            <Textarea
              label="Full Address"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="Full address"
              rows={2}
            />
            <div className="grid grid-cols-3 gap-4">
              <Input
                label="City"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                placeholder="City"
              />
              <Input
                label="State"
                value={formData.state}
                onChange={(e) => handleChange('state', e.target.value)}
                placeholder="State"
              />
              <Input
                label="Pincode"
                value={formData.pincode}
                onChange={(e) => handleChange('pincode', e.target.value)}
                placeholder="Pincode"
              />
            </div>
          </div>
        </Card>

        {/* Affiliation */}
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Globe className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Affiliation Details</h3>
          </div>
          
          <div className="space-y-4">
            <Input
              label="Affiliation Board"
              value={formData.affiliationBoard}
              onChange={(e) => handleChange('affiliationBoard', e.target.value)}
              placeholder="e.g., CBSE, ICSE, State Board"
            />
            <Input
              label="Affiliation Number"
              value={formData.affiliationNumber}
              onChange={(e) => handleChange('affiliationNumber', e.target.value)}
              placeholder="Enter affiliation number"
            />
          </div>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button size="lg" onClick={handleSave} loading={loading} icon={<Save className="w-5 h-5" />}>
          Save Changes
        </Button>
      </div>
    </div>
  );
}
