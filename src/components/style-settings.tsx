'use client';

import { ChangeEvent } from 'react';
import { NhsStyleSettings } from '@/types/template';

type StyleSettingsProps = {
  settings: NhsStyleSettings;
  onChange: (settings: NhsStyleSettings) => void;
};

const typographyOptions: NhsStyleSettings['typographyScale'][] = ['nhs-default', 'nhs-large', 'custom'];
const spacingOptions: NhsStyleSettings['spacingScale'][] = ['nhs-default', 'nhs-compact', 'custom'];
const colorOptions: NhsStyleSettings['colorPreset'][] = ['standard-aa', 'high-contrast', 'custom'];

export default function StyleSettings({ settings, onChange }: StyleSettingsProps) {
  const updateSetting = <Key extends keyof NhsStyleSettings>(key: Key, value: NhsStyleSettings[Key]) => {
    onChange({
      ...settings,
      [key]: value,
    });
  };

  const handleCheckbox = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    updateSetting(name as keyof NhsStyleSettings, checked as any);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <header className="border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Typography</h2>
          <p className="text-sm text-gray-600">
            NHS typography scale ensures legibility across devices. Switch to a compact or custom scale if required.
          </p>
        </header>
        <div className="space-y-3 px-6 py-4">
          {typographyOptions.map((option) => (
            <label key={option} className="flex items-center gap-3 text-sm text-gray-700">
              <input
                type="radio"
                name="typographyScale"
                value={option}
                checked={settings.typographyScale === option}
                onChange={(event) =>
                  updateSetting('typographyScale', event.target.value as NhsStyleSettings['typographyScale'])
                }
              />
              <span className="font-medium capitalize">{option.replace('-', ' ')}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <header className="border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Spacing</h2>
          <p className="text-sm text-gray-600">
            Control overall padding and gap sizes. The NHS default spacing maintains comfortable scan lines.
          </p>
        </header>
        <div className="space-y-3 px-6 py-4">
          {spacingOptions.map((option) => (
            <label key={option} className="flex items-center gap-3 text-sm text-gray-700">
              <input
                type="radio"
                name="spacingScale"
                value={option}
                checked={settings.spacingScale === option}
                onChange={(event) =>
                  updateSetting('spacingScale', event.target.value as NhsStyleSettings['spacingScale'])
                }
              />
              <span className="font-medium capitalize">{option.replace('-', ' ')}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <header className="border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Colour preset</h2>
          <p className="text-sm text-gray-600">
            Choose NHS AA palette, high contrast for accessibility, or a custom palette.
          </p>
        </header>
        <div className="space-y-3 px-6 py-4">
          {colorOptions.map((option) => (
            <label key={option} className="flex items-center gap-3 text-sm text-gray-700">
              <input
                type="radio"
                name="colorPreset"
                value={option}
                checked={settings.colorPreset === option}
                onChange={(event) =>
                  updateSetting('colorPreset', event.target.value as NhsStyleSettings['colorPreset'])
                }
              />
              <span className="font-medium capitalize">{option.replace('-', ' ')}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <header className="border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Branding</h2>
          <p className="text-sm text-gray-600">Toggle clinic branding elements that appear on generated forms.</p>
        </header>
        <div className="space-y-4 px-6 py-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="showLogo"
              checked={settings.showLogo}
              onChange={handleCheckbox}
            />
            <span className="text-sm text-gray-700">Display clinic logo</span>
          </label>
          {settings.showLogo && (
            <input
              type="url"
              value={settings.logoUrl ?? ''}
              onChange={(event) => updateSetting('logoUrl', event.target.value)}
              placeholder="https://clinic.example/logo.svg"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="showFooter"
              checked={settings.showFooter}
              onChange={handleCheckbox}
            />
            <span className="text-sm text-gray-700">Show footer</span>
          </label>
          {settings.showFooter && (
            <textarea
              value={settings.footerText ?? ''}
              onChange={(event) => updateSetting('footerText', event.target.value)}
              rows={2}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter NHS compliant footer content"
            />
          )}
        </div>
      </section>
    </div>
  );
}
