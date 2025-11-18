using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRMS.Application.Clients.EmailQueue
{
    public class BackgroundTaskQueue : IBackgroundTaskQueue, IDisposable
    {
        private readonly ConcurrentQueue<Func<CancellationToken, Task>> _workItems = new();
        private readonly SemaphoreSlim _signal = new(0);

        public Task QueueBackgroundWorkItemAsync(Func<CancellationToken, Task> workItem)
        {
            if (workItem == null)
                throw new ArgumentNullException(nameof(workItem));

            _workItems.Enqueue(workItem);
            _signal.Release();
            return Task.CompletedTask;
        }

        public async Task<Func<CancellationToken, Task>?> DequeueAsync(CancellationToken cancellationToken)
        {
            try
            {
                await _signal.WaitAsync(cancellationToken);
                _workItems.TryDequeue(out var workItem);
                return workItem;
            }
            catch (OperationCanceledException)
            {
                return null;
            }
        }

        public void Dispose()
        {
            _signal?.Dispose();
        }
    }

}
