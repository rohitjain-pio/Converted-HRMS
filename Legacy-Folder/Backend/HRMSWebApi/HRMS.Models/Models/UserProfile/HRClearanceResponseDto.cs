using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRMS.Models.Models.UserProfile
{
    public class HRClearanceResponseDto
    {
         public int ResignationId { get; set; }
        public decimal AdvanceBonusRecoveryAmount { get; set; }
        public string ServiceAgreementDetails { get; set; }
        public decimal CurrentEL { get; set; }
        public int NumberOfBuyOutDays { get; set; }
        public bool ExitInterviewStatus { get; set; }
        public string ExitInterviewDetails { get; set; }
        public string Attachment { get; set; }
    }
}
