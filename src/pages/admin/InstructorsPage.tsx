import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, Edit, Trash2, ShieldAlert, Upload, X } from 'lucide-react';
import { 
  adminGetAllInstructors, 
  adminCreateInstructor, 
  adminUpdateInstructor, 
  adminDeleteInstructor, 
  adminUploadInstructorAvatar 
} from '../../crud/course.crud';
import { toast } from '../../Utils/toast';
import { Modal } from '../../components/ui/modal';

interface IInstructor {
  _id: string;
  firstName: string;
  lastName: string;
  emailId: string;
  avatar?: string;
  socialLinks?: {
    website?: string;
    linkedin?: string;
    github?: string;
    twitter?: string;
    youtube?: string;
  };
  createdAt?: string;
}

export default function InstructorsPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState<IInstructor | null>(null);
  
  // Form states
  const [fullName, setFullName] = useState('');
  const [emailId, setEmailId] = useState('');
  const [website, setWebsite] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [github, setGithub] = useState('');
  const [twitter, setTwitter] = useState('');
  const [youtube, setYoutube] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Instructors
  const { data: instructors = [], isLoading } = useQuery<IInstructor[]>({
    queryKey: ['instructors'],
    queryFn: async () => {
      const res = await adminGetAllInstructors();
      return res.data.data;
    },
  });

  // Filtered instructors
  const filteredInstructors = useMemo(() => {
    if (!searchQuery) return instructors;
    const query = searchQuery.toLowerCase();
    return instructors.filter(
      (inst) =>
        `${inst.firstName} ${inst.lastName}`.toLowerCase().includes(query) ||
        inst.emailId.toLowerCase().includes(query)
    );
  }, [instructors, searchQuery]);

  // Actions
  const handleOpenAddModal = () => {
    setSelectedInstructor(null);
    setFullName('');
    setEmailId('');
    setWebsite('');
    setLinkedin('');
    setGithub('');
    setTwitter('');
    setYoutube('');
    setAvatarFile(null);
    setAvatarPreview(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (inst: IInstructor) => {
    setSelectedInstructor(inst);
    setFullName(`${inst.firstName} ${inst.lastName}`.trim());
    setEmailId(inst.emailId);
    setWebsite(inst.socialLinks?.website || '');
    setLinkedin(inst.socialLinks?.linkedin || '');
    setGithub(inst.socialLinks?.github || '');
    setTwitter(inst.socialLinks?.twitter || '');
    setYoutube(inst.socialLinks?.youtube || '');
    setAvatarFile(null);
    setAvatarPreview(inst.avatar || null);
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (inst: IInstructor) => {
    setSelectedInstructor(inst);
    setIsDeleteModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  // Create / Update Mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      setIsSubmitting(true);
      const parts = fullName.trim().split(/\s+/);
      const firstName = parts[0] || '';
      const lastName = parts.slice(1).join(' ') || '';

      const payload = {
        firstName,
        lastName,
        emailId: emailId.trim(),
        socialLinks: {
          website: website.trim(),
          linkedin: linkedin.trim(),
          github: github.trim(),
          twitter: twitter.trim(),
          youtube: youtube.trim()
        }
      };
      let savedInst: IInstructor;

      if (selectedInstructor) {
        // Update text details
        const res = await adminUpdateInstructor(selectedInstructor._id, payload);
        savedInst = res.data.data;
      } else {
        // Create text details
        const res = await adminCreateInstructor(payload);
        savedInst = res.data.data;
      }

      // If avatar file selected, upload it
      if (avatarFile) {
        await adminUploadInstructorAvatar(savedInst._id, avatarFile);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructors'] });
      toast.success(selectedInstructor ? 'Instructor updated successfully' : 'Instructor created successfully');
      setIsModalOpen(false);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to save instructor';
      toast.error(msg);
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await adminDeleteInstructor(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructors'] });
      toast.success('Instructor deleted successfully');
      setIsDeleteModalOpen(false);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to delete instructor. Note: Instructors assigned to courses cannot be deleted.';
      toast.error(msg);
    }
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !emailId.trim()) {
      toast.error('Full Name and Email are required.');
      return;
    }
    saveMutation.mutate();
  };

  const handleDelete = () => {
    if (selectedInstructor) {
      deleteMutation.mutate(selectedInstructor._id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="font-['Plus_Jakarta_Sans'] font-semibold text-2xl text-white">
            Instructors
          </h1>
          <span className="bg-[#1a1a1a] text-[#ff6b00] text-sm font-semibold px-2.5 py-0.5 rounded-full border border-[#ff6b00]/20">
            {instructors.length} total
          </span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:flex-initial sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737373]" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#131313] border border-[#262626] text-white text-sm rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-[#404040] focus:ring-1 focus:ring-[#404040] transition-colors placeholder:text-[#737373]"
            />
          </div>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#ff6b00] to-[#e05300] hover:from-[#e05300] hover:to-[#c74600] text-white font-semibold text-sm rounded-lg transition-colors shadow-lg shadow-[#ff6b00]/10 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> Add Instructor
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#131313] border border-[#262626] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-[#0a0a0a] border-b border-[#262626]">
                <th className="px-6 py-4 text-[11px] uppercase tracking-wider font-semibold text-[#a3a3a3]">Instructor</th>
                <th className="px-6 py-4 text-[11px] uppercase tracking-wider font-semibold text-[#a3a3a3]">Email</th>
                <th className="px-6 py-4 text-[11px] uppercase tracking-wider font-semibold text-[#a3a3a3] text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, idx) => (
                  <tr key={idx} className="border-b border-[#262626] animate-pulse">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#262626] rounded-full" />
                        <div className="w-24 h-4 bg-[#262626] rounded" />
                      </div>
                    </td>
                    <td className="px-6 py-4"><div className="w-40 h-4 bg-[#262626] rounded" /></td>
                    <td className="px-6 py-4 text-right"><div className="w-16 h-8 bg-[#262626] rounded-lg ml-auto" /></td>
                  </tr>
                ))
              ) : filteredInstructors.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-sm text-[#737373]">
                    {searchQuery ? "No instructors match your search" : "No instructors registered yet"}
                  </td>
                </tr>
              ) : (
                filteredInstructors.map((inst: IInstructor) => {
                  const initials = `${inst.firstName?.[0] || ''}${inst.lastName?.[0] || ''}`.toUpperCase();
                  const name = `${inst.firstName} ${inst.lastName}`.trim();
                  return (
                    <tr key={inst._id} className="border-b border-[#262626] hover:bg-[#181818]/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {inst.avatar ? (
                            <img src={inst.avatar} alt={name} className="w-10 h-10 rounded-full object-cover border border-[#262626]" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-[#1e1e1e] flex items-center justify-center border border-[#ff6b00]/20">
                              <span className="font-['Plus_Jakarta_Sans'] font-bold text-[#ff6b00] text-xs">{initials}</span>
                            </div>
                          )}
                          <span className="font-semibold text-white text-sm">{name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#a3a3a3]">{inst.emailId}</td>
                      <td className="px-6 py-4 text-sm text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(inst)}
                            className="p-2 text-[#a3a3a3] hover:text-white hover:bg-[#262626] rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenDeleteModal(inst)}
                            className="p-2 text-[#a3a3a3] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedInstructor ? 'Edit Instructor' : 'Add Instructor'}
      >
        <form onSubmit={handleSave} className="space-y-4 pt-2">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center justify-center gap-3 mb-4">
            <div className="relative group">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-20 h-20 rounded-full object-cover border-2 border-[#ff6b00]/30" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-[#1e1e1e] flex items-center justify-center border-2 border-dashed border-[#262626]">
                  <Upload className="w-6 h-6 text-[#737373]" />
                </div>
              )}
              <label className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                <Upload className="w-4 h-4 text-white" />
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>
            </div>
            <span className="text-xs text-[#a3a3a3]">Choose Profile Image (Optional)</span>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#a3a3a3] mb-1.5">Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-[#131313] border border-[#262626] text-white text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#404040]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#a3a3a3] mb-1.5">Email *</label>
            <input
              type="email"
              required
              placeholder="e.g. john@email.com"
              value={emailId}
              onChange={(e) => setEmailId(e.target.value)}
              className="w-full bg-[#131313] border border-[#262626] text-white text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#404040]"
            />
          </div>

          <div className="pt-2 border-t border-[#262626]">
            <h4 className="text-sm font-semibold text-white mb-3">Social Links (Optional)</h4>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-[#a3a3a3] mb-1">Website / Portfolio</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full bg-[#131313] border border-[#262626] text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-[#404040]"
                />
              </div>

              <div>
                <label className="block text-xs text-[#a3a3a3] mb-1">LinkedIn</label>
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/..."
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  className="w-full bg-[#131313] border border-[#262626] text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-[#404040]"
                />
              </div>

              <div>
                <label className="block text-xs text-[#a3a3a3] mb-1">GitHub</label>
                <input
                  type="url"
                  placeholder="https://github.com/..."
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  className="w-full bg-[#131313] border border-[#262626] text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-[#404040]"
                />
              </div>

              <div>
                <label className="block text-xs text-[#a3a3a3] mb-1">Twitter / X</label>
                <input
                  type="url"
                  placeholder="https://x.com/..."
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  className="w-full bg-[#131313] border border-[#262626] text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-[#404040]"
                />
              </div>

              <div>
                <label className="block text-xs text-[#a3a3a3] mb-1">YouTube</label>
                <input
                  type="url"
                  placeholder="https://youtube.com/..."
                  value={youtube}
                  onChange={(e) => setYoutube(e.target.value)}
                  className="w-full bg-[#131313] border border-[#262626] text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-[#404040]"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#262626]">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-5 py-2.5 bg-transparent border border-[#262626] text-white font-semibold text-sm rounded-lg hover:bg-[#262626] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-gradient-to-r from-[#ff6b00] to-[#e05300] hover:from-[#e05300] hover:to-[#c74600] text-white font-semibold text-sm rounded-lg transition-colors shadow-lg shadow-[#ff6b00]/10 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Instructor"
      >
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">
            <ShieldAlert className="w-5 h-5 flex-shrink-0" />
            <p>Are you sure you want to delete this instructor? This action is permanent and cannot be undone.</p>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-[#262626]">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-5 py-2.5 bg-transparent border border-[#262626] text-white font-semibold text-sm rounded-lg hover:bg-[#262626] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm rounded-lg transition-colors"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
