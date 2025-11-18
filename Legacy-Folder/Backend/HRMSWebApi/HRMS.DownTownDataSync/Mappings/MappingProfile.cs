using AutoMapper;
using HRMS.Domain.Entities;
using HRMS.Models.Models.Downtown;
using HRMS.Models.Models.Event;
using Microsoft.AspNetCore.Routing.Constraints;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRMS.DownTownDataSync.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {            
            CreateMap<Employee, DowntownData>().ReverseMap();            
            CreateMap<Team, DowntownData>().ForMember(dest => dest.Team_Title, opt => opt.MapFrom(src => src.title)).ReverseMap();
            // CreateMap<Designation, DowntownData>().ForMember(dest => dest.Designation, opt => opt.MapFrom(src => src.Designation)).ReverseMap();
            CreateMap<StatusData, DowntownData>().ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.title)).ReverseMap();
            CreateMap<GenderData, DowntownData>().ForMember(dest => dest.Gender, opt => opt.MapFrom(src => src.title)).ReverseMap();                 
            // CreateMap<DowntownData, Designation>().ForMember(dest => dest.Designation, opt => opt.MapFrom(src => src.Designation)).ReverseMap();
            CreateMap<DowntownData, Team>().ForMember(dest => dest.title, opt => opt.MapFrom(src => src.Team_Title)).ReverseMap();
            CreateMap<DowntownData, GenderData>().ForMember(dest => dest.title, opt => opt.MapFrom(src => src.Gender)).ReverseMap();
            CreateMap<DowntownData, CompanyBranchData>().ForMember(dest => dest.title, opt => opt.MapFrom(src => src.Branch_title)).ReverseMap();
            CreateMap<DowntownData, CountryData>().ForMember(dest => dest.country_name, opt => opt.MapFrom(src => src.Country)).ReverseMap();
            CreateMap<DowntownData, StatusData>().ForMember(dest => dest.title, opt => opt.MapFrom(src => src.Status)).ReverseMap();
            
            CreateMap<EmploymentDetail, DowntownData>().ForMember(dest => dest.Team_Title, opt => opt.MapFrom(src => src.TeamName)).ReverseMap();
                       
            CreateMap<DowntownData, EmployeeRequest>()
                .ForMember(dest => dest.FirstName, opt => opt.MapFrom(src => src.First_Name))
                .ForMember(dest => dest.LastName, opt => opt.MapFrom(src => src.Last_Name))
                .ForMember(dest => dest.AlternatePhone, opt => opt.MapFrom(src => src.Alternate_Phone_Number))
                .ForMember(dest => dest.PersonalEmail, opt => opt.MapFrom(src => src.Email))
                .ForMember(dest => dest.Gender, opt => opt.MapFrom(src => src.Gender))
                .ForMember(dest =>dest.Status, opt => opt.MapFrom(src => src.Status)).ReverseMap();              
               
            CreateMap<DowntownData, EmploymentDetail>()
               .ForMember(dest => dest.TeamId, opt => opt.MapFrom(src => src.Team_id))
                .ForMember(dest => dest.TeamName, opt => opt.MapFrom(src => src.Team_Title)).ReverseMap();

            CreateMap<DowntownData, DowntownEmployeeDataRequestDto>()
             .ForMember(dest => dest.TeamId, opt => opt.MapFrom(src => src.Team_id))
              .ForMember(dest => dest.TeamName, opt => opt.MapFrom(src => src.Team_Title))
               .ForMember(dest => dest.JoiningDate, opt => opt.MapFrom(src => src.Joining_date)).ReverseMap();

            CreateMap<DowntownData, Address>()
                .ForMember(dest => dest.Line1, opt => opt.MapFrom(src => src.Address)).ReverseMap();
            

        }
    }
}
