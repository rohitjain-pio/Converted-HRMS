using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRMS.Application.Clients.EmailQueue
{
    public class QueuedEmailSenderService(IBackgroundTaskQueue taskQueue, ILogger logger) : BackgroundService
    {
        // private readonly ILogger<QueuedEmailSenderService> _logger;
        private readonly IBackgroundTaskQueue _taskQueue = taskQueue;
        private readonly int _maxWorkers = Environment.ProcessorCount * 2; // parallel workers
        private readonly SemaphoreSlim _strictLimit = new(15, 15); // parallel strick limit

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            var workers = new List<Task>();
            
            for (int i = 0; i < _maxWorkers; i++)
            {
                workers.Add(ProcessQueuedItemsAsync(stoppingToken));
            }

            await Task.WhenAll(workers);
        }

        private async Task ProcessQueuedItemsAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    var workItem = await _taskQueue.DequeueAsync(stoppingToken);
                    if (workItem == null) 
                        continue;

                    await _strictLimit.WaitAsync(stoppingToken);
                    
                    try
                    {
                        await workItem(stoppingToken);
                    }
                    finally
                    {
                        _strictLimit.Release();
                    }
                }
                catch (OperationCanceledException)
                {
                    break;
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Failed in {0}", nameof(ProcessQueuedItemsAsync));
                    Console.WriteLine(ex);
                }
            }
        }

        public override void Dispose()
        {
            _strictLimit?.Dispose();
            base.Dispose();
        }
    }
}
