using HRMS.Domain.Entities;

namespace HRMS.Infrastructure.Interface
{
    public interface IProfessionalReferenceRepository: IGenericRepository<ProfessionalReference>
    {
        Task<int> AddProfessionalReferenceAsync(List<ProfessionalReference> professionalReference);
        Task<int> GetReferenceCountAsync(long previousEmployerId);
    }
}