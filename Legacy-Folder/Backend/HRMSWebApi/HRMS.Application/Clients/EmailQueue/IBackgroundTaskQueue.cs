using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRMS.Application.Clients.EmailQueue
{
    public interface IBackgroundTaskQueue
    {
        Task QueueBackgroundWorkItemAsync(Func<CancellationToken, Task> workItem);
        Task<Func<CancellationToken, Task>?> DequeueAsync(CancellationToken cancellationToken);
    }
}
