using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MoraCricketHub.Domain.Entities;

namespace MoraCricketHub.Infrastructure.Persistence.Configurations;

public class OverSummaryConfiguration : IEntityTypeConfiguration<OverSummary>
{
    public void Configure(EntityTypeBuilder<OverSummary> builder)
    {
        builder.HasKey(os => os.Id);
        builder.HasIndex(os => os.InningsId);
        builder.HasIndex(os => new { os.InningsId, os.OverNumber }).IsUnique();

        builder.HasOne(os => os.Innings)
            .WithMany(i => i.OverSummaries)
            .HasForeignKey(os => os.InningsId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}